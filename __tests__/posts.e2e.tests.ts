import {client} from "../src/repositories/db/db";
import {
    clearAllDb,
    createBlog,
    createBlogPostUserLoginComment,
    createPost,
    createSeveralItems,
    createUser2_3_4,
    deletePostById,
    getPostById,
    getPostByIdWithAuth,
    getPostsWithPagination,
    getPostsWithPaginationWithAuth,
    updatePost,
    updatePostLikeStatus
} from "../src/functions/tests-functions";
import {
    basicAuth,
    blogDescription,
    blogName,
    blogUrl,
    fourthLogin,
    postContent,
    postNewContent,
    postNewShortDescription,
    postNewTitle,
    postShortDescription,
    postTitle,
    secondLogin,
    thirdLogin
} from "../src/functions/tests-objects";
import mongoose from "mongoose";
import {MongoClient} from "mongodb";
import {LikeStatusesEnum} from "../src/repositories/db/types";


describe('posts, put like-status', () => {

    jest.setTimeout(3 * 60 * 1000)

    beforeAll(async () => {
        const mongoUri = "mongodb://127.0.0.1:27017" // process.env.MONGO_URL ||
        const client = new MongoClient(mongoUri!)
        await client.connect()
        await mongoose.connect(mongoUri!);
        console.log(" ✅ Connected successfully to mongo db and mongoose");
    })

    afterAll(async () => {
        await client.close();
        await mongoose.disconnect();
        console.log(" ✅ Closed mongo db and mongoose")
    })

    it('Like the post, get post with and without auth token ', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const likeNewPost = await updatePostLikeStatus(createAll.newPostId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likeNewPost.status).toBe(204)

        const getNewPostWithoutAuth= await getPostById(createAll.newPostId)
        expect(getNewPostWithoutAuth.status).toBe(200)

        console.log(getNewPostWithoutAuth.body, "getNewPostWithoutAuth")

        const getNewPost= await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getNewPost.status).toBe(200)

        const expectedPost = {
            id: createAll.newPostId,
            title: createAll.newPostTitle,
            shortDescription: createAll.newPostShortDescription,
            content: createAll.newPostContent,
            blogId: createAll.newBlogId,
            blogName: createAll.newBlogName,
            createdAt: createAll.newPostCreatedAt,
            extendedLikesInfo: {
                likesCount: 1,
                dislikesCount: 0,
                myStatus: LikeStatusesEnum.Like,
                newestLikes: [
                    {
                        addedAt: expect.any(String),
                        userId: createAll.newCommentUserId,
                        login: createAll.newCommentUserLogin
                    }
                ]
            }
        }

        expect(getNewPost.body).toMatchObject(expectedPost)

    })

    it('like the post by user 1, user 2, user 3, user 4. ' +
        'get the post after each like by user 1. NewestLikes should be sorted in descending', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const likeNewPostByUser1 = await updatePostLikeStatus(createAll.newPostId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likeNewPostByUser1.status).toBe(204)

        const createdUserTokens2_3_4= await createUser2_3_4()

        const likeNewPostByUser2 = await updatePostLikeStatus(createAll.newPostId,
            createdUserTokens2_3_4.createdUser2AccessToken, LikeStatusesEnum.Like)
        expect(likeNewPostByUser2.status).toBe(204)

        const likeNewPostByUser3 = await updatePostLikeStatus(createAll.newPostId,
            createdUserTokens2_3_4.createdUser3AccessToken, LikeStatusesEnum.Like)
        expect(likeNewPostByUser3.status).toBe(204)

        const likeNewPostByUser4 = await updatePostLikeStatus(createAll.newPostId,
            createdUserTokens2_3_4.createdUser4AccessToken, LikeStatusesEnum.Like)
        expect(likeNewPostByUser4.status).toBe(204)

        const getPostWithAuth= await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getPostWithAuth.status).toBe(200)

        const expectedPostAuth = {
                likesCount: 4,
                dislikesCount: 0,
                myStatus: LikeStatusesEnum.Like,
                newestLikes: [
                    {
                        addedAt: expect.any(String),
                        userId: createdUserTokens2_3_4.user4Id,
                        login: fourthLogin
                    },
                    {
                        addedAt: expect.any(String),
                        userId: createdUserTokens2_3_4.user3Id,
                        login: thirdLogin
                    },
                    {
                        addedAt: expect.any(String),
                        userId: createdUserTokens2_3_4.user2Id,
                        login: secondLogin
                    },
                ]
            }


        expect(getPostWithAuth.body.extendedLikesInfo.newestLikes.length).toBe(3)
        expect(getPostWithAuth.body.extendedLikesInfo).toMatchObject(expectedPostAuth)

        const getPostByUser1= await getPostById(createAll.newPostId)
        expect(getPostByUser1.status).toBe(200)

        const expectedPost = {
            likesCount: 4,
            dislikesCount: 0,
            myStatus: LikeStatusesEnum.None,
            newestLikes: [
                {
                    addedAt: expect.any(String),
                    userId: createdUserTokens2_3_4.user4Id,
                    login: fourthLogin
                },
                {
                    addedAt: expect.any(String),
                    userId: createdUserTokens2_3_4.user3Id,
                    login: thirdLogin
                },
                {
                    addedAt: expect.any(String),
                    userId: createdUserTokens2_3_4.user2Id,
                    login: secondLogin
                },
            ]
        }


        expect(getPostByUser1.body.extendedLikesInfo.newestLikes.length).toBe(3)
        expect(getPostByUser1.body.extendedLikesInfo).toMatchObject(expectedPost)

    })

    it('dislike the post by user 1, user 2; like the post by user 3; ' +
        'get the post after each like by user 1', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const dislikePostByUser1 = await updatePostLikeStatus(createAll.newPostId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Dislike)
        expect(dislikePostByUser1.status).toBe(204)

        const getPostWithAuth = await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getPostWithAuth.status).toBe(200)

        const expectedPost = {
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatusesEnum.Dislike,
            newestLikes: []
        }

        console.log(getPostWithAuth.body, "getPostWithAuth.body")

        expect(getPostWithAuth.body.extendedLikesInfo.newestLikes.length).toBe(0)
        expect(getPostWithAuth.body.extendedLikesInfo).toMatchObject(expectedPost)

        const createdUsers2_3_4= await createUser2_3_4()

        const dislikePostByUser2 = await updatePostLikeStatus(createAll.newPostId,
            createdUsers2_3_4.createdUser2AccessToken, LikeStatusesEnum.Dislike)
        expect(dislikePostByUser2.status).toBe(204)

        const getPostWithAuthAfter2 = await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getPostWithAuthAfter2.status).toBe(200)


        console.log(getPostWithAuthAfter2.body, "getPostWithAuthAfter2.body")

        const expectedPost2 = {
            likesCount: 0,
            dislikesCount: 2,
            myStatus: LikeStatusesEnum.Dislike,
            newestLikes: []
        }

        expect(getPostWithAuthAfter2.body.extendedLikesInfo.newestLikes.length).toBe(0)
        expect(getPostWithAuthAfter2.body.extendedLikesInfo).toStrictEqual(expectedPost2)


        const likePostByUser3 = await updatePostLikeStatus(createAll.newPostId,
            createdUsers2_3_4.createdUser3AccessToken, LikeStatusesEnum.Like)
        expect(likePostByUser3.status).toBe(204)

        const getPostWithAuthAfter3 = await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getPostWithAuthAfter3.status).toBe(200)


        console.log(getPostWithAuthAfter3.body, "getPostWithAuthAfter3.body")

        const expectedPost3 = {
            likesCount: 1,
            dislikesCount: 2,
            myStatus: LikeStatusesEnum.Dislike,
            newestLikes: [{
                addedAt: expect.any(String),
                userId: createdUsers2_3_4.user3Id,
                login: thirdLogin
            }]
        }

        expect(getPostWithAuthAfter3.body.extendedLikesInfo.newestLikes.length).toBe(1)
        expect(getPostWithAuthAfter3.body.extendedLikesInfo).toStrictEqual(expectedPost3)

    })

    it(' like the post by user 1; dislike the post by user 1; ' +
        'set none status by user 1; get the post after each like by user 1', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const likePostByUser1 = await updatePostLikeStatus(createAll.newPostId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likePostByUser1.status).toBe(204)

        const getPostWithAuth = await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getPostWithAuth.status).toBe(200)

        const expectedPost = {
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatusesEnum.Like,
            newestLikes: [{
                addedAt: expect.any(String),
                userId: createAll.newUserId,
                login: createAll.newUserLogin
            }]
        }

        expect(getPostWithAuth.body.extendedLikesInfo.newestLikes.length).toBe(1)
        expect(getPostWithAuth.body.extendedLikesInfo).toMatchObject(expectedPost)

        const dislikePostByUser1 = await updatePostLikeStatus(createAll.newPostId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Dislike)
        expect(dislikePostByUser1.status).toBe(204)

        const getPostWithAuth2 = await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getPostWithAuth2.status).toBe(200)

        const expectedPost2 = {
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatusesEnum.Dislike,
            newestLikes: []
        }

        expect(getPostWithAuth2.body.extendedLikesInfo.newestLikes.length).toBe(0)
        expect(getPostWithAuth2.body.extendedLikesInfo).toMatchObject(expectedPost2)

        const setNoneOnPostByUser1 = await updatePostLikeStatus(createAll.newPostId,
            createAll.createdUserAccessToken, LikeStatusesEnum.None)
        expect(setNoneOnPostByUser1.status).toBe(204)

        const getPostWithAuth3 = await getPostByIdWithAuth(createAll.newPostId,  createAll.createdUserAccessToken)
        expect(getPostWithAuth3.status).toBe(200)

        const expectedPost3 = {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatusesEnum.None,
            newestLikes: []
        }

        expect(getPostWithAuth3.body.extendedLikesInfo.newestLikes.length).toBe(0)
        expect(getPostWithAuth3.body.extendedLikesInfo).toMatchObject(expectedPost3)


    })

    it('Create 6 posts, Like the post1, get all posts with pagiation', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const url = "/posts"
        const body = {
            "title": "title",
            "shortDescription": "shortDescription",
            "content": "content",
            "blogId": createAll.newBlogId
        }
        const create6Posts = await createSeveralItems(5, url, body, basicAuth)
        expect(create6Posts.length).toBe(5)

        const createdUsers2_3_4= await createUser2_3_4()

        const likePost1ByUser1 = await updatePostLikeStatus(createAll.newPostId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likePost1ByUser1.status).toBe(204)

        const likePost1ByUser2 = await updatePostLikeStatus(createAll.newPostId,
            createdUsers2_3_4.createdUser2AccessToken, LikeStatusesEnum.Like)
        expect(likePost1ByUser2.status).toBe(204)

        const getPost1WithAuthAfter = await getPostsWithPaginationWithAuth(null,
            null, null, null, createAll.createdUserAccessToken)
        expect(getPost1WithAuthAfter.status).toBe(200)
        expect(getPost1WithAuthAfter.body.items.length).toBe(6)

        const expectedPostLikeInfo = {
            likesCount: 2,
            dislikesCount: 0,
            myStatus: LikeStatusesEnum.Like,
            newestLikes: [{
                addedAt: expect.any(String),
                userId: createdUsers2_3_4.user2Id,
                login: secondLogin
            },
                {
                    addedAt: expect.any(String),
                    userId: createAll.newUserId,
                    login: createAll.newUserLogin
                }]
        }

        expect(getPost1WithAuthAfter.body.items[5].extendedLikesInfo).toStrictEqual(expectedPostLikeInfo)

        //like post 2 by user 2, user 3
        const likePost2ByUser2 = await updatePostLikeStatus(create6Posts[0].id,
            createdUsers2_3_4.createdUser2AccessToken, LikeStatusesEnum.Like)
        expect(likePost2ByUser2.status).toBe(204)

        const likePost2ByUser3 = await updatePostLikeStatus(create6Posts[0].id,
            createdUsers2_3_4.createdUser3AccessToken, LikeStatusesEnum.Like)
        expect(likePost2ByUser3.status).toBe(204)

        const getPost1WithAuthAfter2 = await getPostsWithPaginationWithAuth(null,
            null, null, null, createAll.createdUserAccessToken)
        expect(getPost1WithAuthAfter2.status).toBe(200)

        const expectedPost2LikeInfo = {
            likesCount: 2,
            dislikesCount: 0,
            myStatus: LikeStatusesEnum.None,
            newestLikes: [{
                addedAt: expect.any(String),
                userId: createdUsers2_3_4.user3Id,
                login: thirdLogin
            },
                {
                    addedAt: expect.any(String),
                    userId: createdUsers2_3_4.user2Id,
                    login: secondLogin
                }]
        }

        expect(getPost1WithAuthAfter2.body.items[5].extendedLikesInfo).toStrictEqual(expectedPostLikeInfo)
        expect(getPost1WithAuthAfter2.body.items[4].extendedLikesInfo).toStrictEqual(expectedPost2LikeInfo)

        // dislike post 3 by user 1; like post 4 by user 1, user 4, user 2, user 3;

        const dislikePost3ByUser1 = await updatePostLikeStatus(create6Posts[1].id,
            createAll.createdUserAccessToken, LikeStatusesEnum.Dislike)
        expect(dislikePost3ByUser1.status).toBe(204)



        const likePost4ByUser1 = await updatePostLikeStatus(create6Posts[3].id,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likePost4ByUser1.status).toBe(204)

        const likePost4ByUser4 = await updatePostLikeStatus(create6Posts[3].id,
            createdUsers2_3_4.createdUser4AccessToken, LikeStatusesEnum.Like)
        expect(likePost4ByUser4.status).toBe(204)

        const likePost4ByUser2 = await updatePostLikeStatus(create6Posts[3].id,
            createdUsers2_3_4.createdUser2AccessToken, LikeStatusesEnum.Like)
        expect(likePost4ByUser2.status).toBe(204)

        const likePost4ByUser3 = await updatePostLikeStatus(create6Posts[3].id,
            createdUsers2_3_4.createdUser3AccessToken, LikeStatusesEnum.Like)
        expect(likePost4ByUser3.status).toBe(204)

        const expectedPost3LikeInfo = {
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatusesEnum.Dislike,
            newestLikes: []
        }

        const expectedPost4LikeInfo = {
            likesCount: 4,
            dislikesCount: 0,
            myStatus: LikeStatusesEnum.Like,
            newestLikes: [
                {
                addedAt: expect.any(String),
                userId: createdUsers2_3_4.user3Id,
                login: thirdLogin
                },
                {
                    addedAt: expect.any(String),
                    userId: createdUsers2_3_4.user2Id,
                    login: secondLogin
                },
                {
                    addedAt: expect.any(String),
                    userId: createdUsers2_3_4.user4Id,
                    login: fourthLogin
                }
                ]
        }

        const getPost1WithAuthAfter3 = await getPostsWithPaginationWithAuth(null,
            null, null, null, createAll.createdUserAccessToken)
        expect(getPost1WithAuthAfter3.status).toBe(200)

        expect(getPost1WithAuthAfter3.body.items[5].extendedLikesInfo).toStrictEqual(expectedPostLikeInfo)
        expect(getPost1WithAuthAfter3.body.items[4].extendedLikesInfo).toStrictEqual(expectedPost2LikeInfo)
        expect(getPost1WithAuthAfter3.body.items[3].extendedLikesInfo).toStrictEqual(expectedPost3LikeInfo)
        expect(getPost1WithAuthAfter3.body.items[1].extendedLikesInfo).toStrictEqual(expectedPost4LikeInfo)


    })

})


describe('Posts', () => {

    jest.setTimeout(3 * 60 * 1000)

    beforeAll(async () => {
        const mongoUri = "mongodb://127.0.0.1:27017" // process.env.MONGO_URL ||
        const client = new MongoClient(mongoUri!)
        await client.connect()
        await mongoose.connect(mongoUri!);
        console.log(" ✅ Connected successfully to mongo db and mongoose");
    })

    afterAll(async () => {
        await client.close();
        await mongoose.disconnect();
        console.log(" ✅ Closed mongo db and mongoose")
    })

    beforeEach(async () => {
        await clearAllDb()
    })


    it('Create post, status 201; Get/postById status 200', async () => {

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const expectedPost = {
            "id": expect.any(String),
            "title": expect.any(String),
            "shortDescription": expect.any(String),
            "content": expect.any(String),
            "blogId": createNewBlog.body.id,
            "blogName": createNewBlog.body.name,
            "createdAt": expect.any(String),
            "extendedLikesInfo": {
                "likesCount": 0,
                "dislikesCount": 0,
                "myStatus": "None",
                "newestLikes": []
            }
        }

        expect(createNewPost.body).toMatchObject(expectedPost);

        expect(createNewPost.body.createdAt).toMatch( /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/)
        expect(createNewPost.body.blogId).toMatch(createNewBlog.body.id)
        expect(createNewPost.body.blogName).toMatch(createNewBlog.body.name)

        const getPost = await getPostById(createNewPost.body.id)
        expect(getPost.status).toBe(200)
        expect(getPost.body).toMatchObject(expectedPost)

    })

    it('Create 5 posts; Get all posts with pagination', async () => {

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const postFullBody = {
            "title": postTitle,
            "shortDescription": postShortDescription,
            "content": postContent,
            "blogId": createNewBlog.body.id
        }

        const create5Posts = await createSeveralItems(5, '/posts', postFullBody, basicAuth)

        expect(create5Posts.length).toBe(5)

        const expectedPost = {
            "id": expect.any(String),
            "title": expect.any(String),
            "shortDescription": expect.any(String),
            "content": expect.any(String),
            "blogId": createNewBlog.body.id,
            "blogName": createNewBlog.body.name,
            "createdAt": expect.any(String)
        }
        expect(create5Posts[1]).toMatchObject(expectedPost)

        const getAllPostsWithPagination = await getPostsWithPagination("sortBy=createdAt",
            "sortDirection=asc", "pageNumber=2", "pageSize=3")
        expect(getAllPostsWithPagination.status).toBe(200)

        const expectedPostWithPagination = {
            "pagesCount": expect.any(Number),
            "page": expect.any(Number),
            "pageSize": expect.any(Number),
            "totalCount": expect.any(Number),
            "items": expect.any(Array)
        }
        expect(getAllPostsWithPagination.body).toMatchObject(expectedPostWithPagination)
    })

    it('Update Post, Get Post By Id, Delete post, Get null', async () => {

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const updateNewPost = await updatePost(postNewTitle, postNewShortDescription, postNewContent, createNewBlog.body.id, createNewPost.body.id)
        expect(updateNewPost.status).toBe(204)

        const getUpdatedPost = await getPostById(createNewPost.body.id)
        expect(getUpdatedPost.status).toBe(200)

        const expectedUpdatedPost = {
            "id": createNewPost.body.id,
            "title": postNewTitle,
            "shortDescription": postNewShortDescription,
            "content": postNewContent,
            "blogId": createNewBlog.body.id,
            "blogName": createNewBlog.body.name,
            "createdAt": expect.any(String)
        }

        expect(getUpdatedPost.body).toMatchObject(expectedUpdatedPost)

        const deleteUpdatedPost = await deletePostById(createNewPost.body.id)
        expect(deleteUpdatedPost.status).toBe(204)

        const getAllPostsWithPagination = await getPostsWithPagination("sortBy=createdAt",
            "sortDirection=asc", "pageNumber=2", "pageSize=3")
        expect(getAllPostsWithPagination.status).toBe(200)

        expect(getAllPostsWithPagination.body.items.length).toBe(0)

    })
})

