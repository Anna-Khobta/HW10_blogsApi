import {app} from "../src/settings";
import request from "supertest"
import {BlogType, LikeStatusesEnum} from "../src/repositories/db/types";
import {
    authLogin,
    authMe,
    clearAllDb,
    createBlog, createBlogPostUserLoginComment,
    createComment,
    createPost,
    createSeveralItems,
    createUser, createUser2,
    deleteComment, getAllCommentsOfPost,
    getBlogById,
    getBlogsWithPagination,
    getCommentById,
    getCommentsWithPagination,
    getNewCommentWithLike,
    updateComment,
    updateCommentLikeStatus,
} from "../src/functions/tests-functions";
import {client} from "../src/repositories/db/db";
import {
    basicAuth,
    blogDescription,
    blogName,
    blogSecondDescription,
    blogSecondName,
    blogSecondUrl,
    blogUrl,
    commentContent,
    myEmail,
    myLogin,
    myLoginOrEmail,
    myPassword,
    newPassword,
    postContent,
    postNewContent,
    postNewShortDescription,
    postNewTitle,
    postShortDescription,
    postTitle,
    secondEmail,
    secondLogin,
    secondLoginOrEmail,
    thirdEmail,
    thirdLogin,
    thirdLoginOrEmail,
    thirdPassword
} from "../src/functions/tests-objects";
import {MongoClient} from "mongodb";
import mongoose from "mongoose";


describe('/Comments', () => {

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

    it('Create Post, blog, with basic authorization', async () => {

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const expectedBlog = {
            id: expect.any(String),
            name: expect.any(String),
            description: expect.any(String),
            websiteUrl: expect.any(String),
            createdAt: expect.any(String),
            isMembership: false
        }

        expect(createNewBlog.body).toMatchObject(expectedBlog)
        expect(createNewBlog.body.createdAt).toMatch(/^20\d{2}(-[01]\d){2}T([0-2]\d):[0-5]\d:[0-5]\d\.\d{3}Z$/)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const expectedPost = {
            "id": expect.any(String),
            "title": expect.any(String),
            "shortDescription": expect.any(String),
            "content": expect.any(String),
            "blogId": createNewBlog.body.id,
            "blogName": createNewBlog.body.name,
            "createdAt": expect.any(String)
        }

        expect(createNewPost.body).toMatchObject(expectedPost);

        expect(createNewPost.body.createdAt).toMatch(/^20\d{2}(-[01]\d){2}T([0-2]\d):[0-5]\d:[0-5]\d\.\d{3}Z$/)
        expect(createNewPost.body.blogId).toMatch(createNewBlog.body.id)
        expect(createNewPost.body.blogName).toMatch(createNewBlog.body.name)

        const getBlog = await getBlogById(createNewBlog.body.id)
        expect(getBlog.status).toBe(200)
        expect(getBlog.body).toMatchObject(expectedBlog)

    })

    it('Get, 10 blogs, with pagination', async () => {

        await clearAllDb()

        let blogs: BlogType[] = []

        for (let i = 0; i < 10; i++) {
            const createdResponse = await request(app)
                .post('/blogs')
                .set('Authorization', basicAuth)
                .send({
                    "name": "Anna",
                    "description": "1 description",
                    "websiteUrl": "1google.com"
                })
            blogs.push(createdResponse.body)
        }

        const getAllBlogs = await getBlogsWithPagination("sortBy=createdAt",
            "sortDirection=asc", "pageNumber=2", "pageSize=3")
        expect(getAllBlogs.status).toBe(200)

        const expectedBlogsWithPagination = {
            "pagesCount": expect.any(Number),
            "page": expect.any(Number),
            "pageSize": expect.any(Number),
            "totalCount": expect.any(Number),
            "items": expect.any(Array)
        }
        expect(getAllBlogs.body).toMatchObject(expectedBlogsWithPagination)

    })

    it('create blog and post, create user, login user, auth with token', async () => {

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(createNewUser.status).toBe(201)

        const expectedUser = {
            id: expect.any(String),
            login: myLogin,
            email: myEmail,
            createdAt: expect.any(String)
        }

        expect(createNewUser.body).toEqual(expectedUser)

        const loginMyUser = await authLogin(myLoginOrEmail, myPassword)
        expect(loginMyUser.status).toBe(200)

        const createdUserAccessToken = loginMyUser.body.accessToken
        expect(createdUserAccessToken).not.toBeUndefined()

        const getInfoAboutMe = await authMe(createdUserAccessToken)
        expect(getInfoAboutMe.status).toBe(200)

        const authMeExpected = {
            email: myEmail,
            login: myLogin,
            userId: expectedUser.id
        }

        expect(getInfoAboutMe.body).toEqual(authMeExpected)

    })

    it('create comment', async () => {

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(createNewUser.status).toBe(201)

        const loginMyUser = await authLogin(myLoginOrEmail, myPassword)
        expect(loginMyUser.status).toBe(200)

        const createdUserAccessToken = loginMyUser.body.accessToken

        const createNewComment = await createComment(createNewPost.body.id, createdUserAccessToken)
        expect(createNewComment.status).toBe(201)

        const expectedComment = {
            id: expect.any(String),
            content: commentContent,
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login
            },
            createdAt: expect.any(String),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatusesEnum.None
            }
        }

        expect(createNewComment.body).toEqual(expectedComment)

    })

    it('update comment, than delete comment', async () => {

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(createNewUser.status).toBe(201)

        const loginMyUser = await authLogin(myLoginOrEmail, myPassword)
        expect(loginMyUser.status).toBe(200)

        const createdUserAccessToken = loginMyUser.body.accessToken

        const createNewComment = await createComment(createNewPost.body.id, createdUserAccessToken)
        expect(createNewComment.status).toBe(201)

        const updateNewComment = await updateComment(createNewComment.body.id, createdUserAccessToken)
        expect(updateNewComment.status).toBe(204)

        const deleteUpdateComment = await deleteComment(createNewComment.body.id, createdUserAccessToken)
        expect(deleteUpdateComment.status).toBe(204)

        const checkIfCommentDeleted = await getCommentById(createNewComment.body.id)
        expect(checkIfCommentDeleted.status).toBe(404)

    })

    it('return comments for special post with pagination', async () => {

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(createNewUser.status).toBe(201)

        const loginMyUser = await authLogin(myLoginOrEmail, myPassword)
        expect(loginMyUser.status).toBe(200)

        const url = "/posts/" + createNewPost.body.id + '/comments'
        const body = {content: commentContent}
        const auth = "Bearer" + " " + loginMyUser.body.accessToken

        const create13Comments = await createSeveralItems(13, url, body, auth)
        expect(create13Comments.length).toBe(13)

        const expectedComment = {
            id: expect.any(String),
            content: expect.any(String),
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login
            },
            createdAt: expect.any(String)
        }

        expect(create13Comments[1]).toMatchObject(expectedComment)

        const getAllCommentsForSpecialPost = await getCommentsWithPagination("sortBy=createdAt",
            "sortDirection=asc", "pageNumber=2", "pageSize=3", createNewPost.body.id)
        expect(getAllCommentsForSpecialPost.status).toBe(200)

        const expectedCommentsWithPagination = {
            "pagesCount": expect.any(Number),
            "page": expect.any(Number),
            "pageSize": expect.any(Number),
            "totalCount": expect.any(Number),
            "items": expect.any(Array)
        }
        expect(getAllCommentsForSpecialPost.body).toMatchObject(expectedCommentsWithPagination)

    })
})


describe('/Comments, Likes', () => {

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

    it('Create Comment, Like comment', async () => {

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(createNewUser.status).toBe(201)

        const loginMyUser = await authLogin(myLoginOrEmail, myPassword)
        expect(loginMyUser.status).toBe(200)

        const createdUserAccessToken = loginMyUser.body.accessToken

        const createNewComment = await createComment(createNewPost.body.id, createdUserAccessToken)
        expect(createNewComment.status).toBe(201)

        expect(createNewComment.body).toMatchObject(
            {
                id: createNewComment.body.id,
                content: createNewComment.body.content,
                commentatorInfo: {
                    userId: createNewUser.body.id,
                    userLogin: createNewUser.body.login
                },
                createdAt: createNewComment.body.createdAt,
                likesInfo: {
                    "likesCount": 0,
                    "dislikesCount": 0,
                    "myStatus": "None"
                }
            }
        )

        const updateNewComment = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken, LikeStatusesEnum.Like)
        expect(updateNewComment.status).toBe(204)

        const getNewComment = await getNewCommentWithLike(createNewComment.body.id, createdUserAccessToken)
        expect(getNewComment.status).toBe(200)

        const expectedComment = {
            id: createNewComment.body.id,
            content: createNewComment.body.content,
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login
            },
            createdAt: createNewComment.body.createdAt,
            likesInfo: {
                "likesCount": 1,
                "dislikesCount": 0,
                "myStatus": LikeStatusesEnum.Like
            }
        }

        expect(getNewComment.body).toMatchObject(expectedComment)

        const createNewBlog2 = await createBlog(blogSecondName, blogSecondDescription, blogSecondUrl)
        expect(createNewBlog2.status).toBe(201)

        const createNewPost2 = await createPost(postNewTitle, postNewShortDescription, postNewContent, createNewBlog2.body.id)
        expect(createNewPost2.status).toBe(201)

        const createNewUser2 = await createUser(secondLogin, newPassword, secondEmail, basicAuth)
        expect(createNewUser2.status).toBe(201)

        const loginMyUser2 = await authLogin(secondLoginOrEmail, newPassword)
        expect(loginMyUser2.status).toBe(200)

        const createdUserAccessToken2 = loginMyUser2.body.accessToken

        const updateNewComment2 = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken2, LikeStatusesEnum.Dislike)
        expect(updateNewComment2.status).toBe(204)

        const getNewComment2 = await getNewCommentWithLike(createNewComment.body.id, createdUserAccessToken2)
        expect(getNewComment2.status).toBe(200)

        const expectedComment2 = {
            id: createNewComment.body.id,
            content: createNewComment.body.content,
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login
            },
            createdAt: createNewComment.body.createdAt,
            likesInfo: {
                "likesCount": 1,
                "dislikesCount": 1,
                "myStatus": LikeStatusesEnum.Dislike
            }
        }

        expect(getNewComment2.body).toMatchObject(expectedComment2)
    })


    it('GET => /comments/:id; with auth', async () => {

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(createNewUser.status).toBe(201)

        const loginMyUser = await authLogin(myLoginOrEmail, myPassword)
        expect(loginMyUser.status).toBe(200)

        const createdUserAccessToken = loginMyUser.body.accessToken

        const myCookies = loginMyUser.headers['set-cookie'][0]

        expect(loginMyUser.body).toMatchObject({
            "accessToken": expect.any(String)
        });

        expect(myCookies).toBeDefined()


        const createNewComment = await createComment(createNewPost.body.id, createdUserAccessToken)
        expect(createNewComment.status).toBe(201)

        expect(createNewComment.body).toMatchObject(
            {
                id: createNewComment.body.id,
                content: createNewComment.body.content,
                commentatorInfo: {
                    userId: createNewUser.body.id,
                    userLogin: createNewUser.body.login
                },
                createdAt: createNewComment.body.createdAt,
                likesInfo: {
                    "likesCount": 0,
                    "dislikesCount": 0,
                    "myStatus": "None"
                }
            }
        )

        const updateNewComment = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken, LikeStatusesEnum.Like)
        expect(updateNewComment.status).toBe(204)


        const getNewComment1 = await getNewCommentWithLike(createNewComment.body.id, createdUserAccessToken)
        expect(getNewComment1.status).toBe(200)

        expect(getNewComment1.body.likesInfo.likesCount).toBe(1)
        expect(getNewComment1.body.likesInfo.myStatus).toBe("Like")


        /*      const getNewComment = await getNewCommentWithAuthCookies(createNewComment.body.id, myCookies)
              expect(getNewComment.status).toBe(200)

              expect(getNewComment.body.likesInfo.likesCount).toBe(1)
              expect(getNewComment.body.likesInfo.myStatus).toBe("Like")*/

    })


    it('Create Comment, dislike the comment by user 1, user 2; ' +
        'like the comment by user 3; get the comment after each like by user 1', async () => {

        //await waitSomeSeconds(5)

        await clearAllDb()

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        const createNewPost = await createPost(postTitle, postShortDescription, postContent, createNewBlog.body.id)
        expect(createNewPost.status).toBe(201)

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(createNewUser.status).toBe(201)

        const loginMyUser = await authLogin(myLoginOrEmail, myPassword)
        expect(loginMyUser.status).toBe(200)

        const createdUserAccessToken = loginMyUser.body.accessToken

        const createNewComment = await createComment(createNewPost.body.id, createdUserAccessToken)
        expect(createNewComment.status).toBe(201)

        const dislikeNewComment1 = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken, LikeStatusesEnum.Dislike)
        expect(dislikeNewComment1.status).toBe(204)

        const getNewComment = await getNewCommentWithLike(createNewComment.body.id, createdUserAccessToken)
        expect(getNewComment.status).toBe(200)

        /*const expCom = {...getNewComment.body,  likesInfo: {
                "likesCount": 0,
                "dislikesCount": 1,
                "myStatus": LikeStatusesEnum.Dislike
            }} // спрэд */
        //TODO изучить

        const expectedComment = {
            id: createNewComment.body.id,
            content: createNewComment.body.content,
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login
            },
            createdAt: createNewComment.body.createdAt,
            likesInfo: {
                "likesCount": 0,
                "dislikesCount": 1,
                "myStatus": LikeStatusesEnum.Dislike
            }
        }
        expect(getNewComment.body).toStrictEqual(expectedComment)

        const createNewUser2 = await createUser(secondLogin, newPassword, secondEmail, basicAuth)
        expect(createNewUser2.status).toBe(201)

        const loginMyUser2 = await authLogin(secondLoginOrEmail, newPassword)
        expect(loginMyUser2.status).toBe(200)

        const createdUserAccessToken2 = loginMyUser2.body.accessToken

        const updateNewComment2 = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken2, LikeStatusesEnum.Dislike)
        expect(updateNewComment2.status).toBe(204)

        const getNewComment2By1User = await getNewCommentWithLike(createNewComment.body.id, createdUserAccessToken)
        expect(getNewComment2By1User.status).toBe(200)

        const expectedComment2 = {
            id: createNewComment.body.id,
            content: createNewComment.body.content,
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login
            },
            createdAt: createNewComment.body.createdAt,
            likesInfo: {
                "likesCount": 0,
                "dislikesCount": 2,
                "myStatus": LikeStatusesEnum.Dislike
            }
        }
        expect(getNewComment2By1User.body).toStrictEqual(expectedComment2)


        const createNewUser3 = await createUser(thirdLogin, thirdPassword, thirdEmail, basicAuth)
        expect(createNewUser3.status).toBe(201)

        const loginMyUser3 = await authLogin(thirdLoginOrEmail, thirdPassword)
        expect(loginMyUser3.status).toBe(200)

        const createdUserAccessToken3 = loginMyUser3.body.accessToken

        const updateNewComment3 = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken3, LikeStatusesEnum.Like)
        expect(updateNewComment3.status).toBe(204)


        const getNewComment3By1User = await getNewCommentWithLike(createNewComment.body.id, createdUserAccessToken)
        expect(getNewComment3By1User.status).toBe(200)

        const expectedComment3 = {
            id: createNewComment.body.id,
            content: createNewComment.body.content,
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login
            },
            createdAt: createNewComment.body.createdAt,
            likesInfo: {
                "likesCount": 1,
                "dislikesCount": 2,
                "myStatus": LikeStatusesEnum.Dislike
            }
        }


        const likeByFirstUser = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likeByFirstUser.status).toBe(204)


        const get = await getNewCommentWithLike(createNewComment.body.id, createdUserAccessToken)
        expect(get.status).toBe(200)
        expect(get.body.likesInfo).toStrictEqual({
            "likesCount": 2,
            "dislikesCount": 1,
            "myStatus": LikeStatusesEnum.Like
        })

    })

    it(':Like the comment twice by user 1; ' +
        'get the comment after each like by user 1', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const likeNewComment = await updateCommentLikeStatus(createAll.newCommentId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likeNewComment.status).toBe(204)

        const getNewCommentStatus = await getNewCommentWithLike(createAll.newCommentId, createAll.createdUserAccessToken)
        expect(getNewCommentStatus.status).toBe(200)

        const expectedComment = {
            id: createAll.newCommentId,
            content: createAll.newCommentContent,
            commentatorInfo: {
                userId: createAll.newCommentUserId,
                userLogin: createAll.newCommentUserLogin,
            },
            createdAt: createAll.newCommentCreatedAt,
            likesInfo: {
                "likesCount": 1,
                "dislikesCount": 0,
                "myStatus": LikeStatusesEnum.Like
            }
        }
        expect(getNewCommentStatus.body).toMatchObject(expectedComment)

        const likeNewComment2 = await updateCommentLikeStatus(createAll.newCommentId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likeNewComment2.status).toBe(204)

        const getNewCommentStatus2 = await getNewCommentWithLike(createAll.newCommentId, createAll.createdUserAccessToken)
        expect(getNewCommentStatus2.status).toBe(200)

        expect(getNewCommentStatus2.body).toMatchObject(expectedComment)

    })


    it('like the comment by user 1; dislike the comment by user 1;' +
        ' set none status by user 1; get the comment after each like by user 1', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const likeNewComment = await updateCommentLikeStatus(createAll.newCommentId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likeNewComment.status).toBe(204)

        const getNewCommentStatus = await getNewCommentWithLike(createAll.newCommentId, createAll.createdUserAccessToken)
        expect(getNewCommentStatus.status).toBe(200)

        const expectedComment = {
            id: createAll.newCommentId,
            content: createAll.newCommentContent,
            commentatorInfo: {
                userId: createAll.newCommentUserId,
                userLogin: createAll.newCommentUserLogin,
            },
            createdAt: createAll.newCommentCreatedAt,
            likesInfo: {
                "likesCount": 1,
                "dislikesCount": 0,
                "myStatus": LikeStatusesEnum.Like
            }
        }
        expect(getNewCommentStatus.body).toMatchObject(expectedComment)

        const likeNewComment2 = await updateCommentLikeStatus(createAll.newCommentId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Dislike)
        expect(likeNewComment2.status).toBe(204)

        const getNewCommentStatus2 = await getNewCommentWithLike(createAll.newCommentId, createAll.createdUserAccessToken)
        expect(getNewCommentStatus2.status).toBe(200)

        const expectedComment2 = {
            id: createAll.newCommentId,
            content: createAll.newCommentContent,
            commentatorInfo: {
                userId: createAll.newCommentUserId,
                userLogin: createAll.newCommentUserLogin,
            },
            createdAt: createAll.newCommentCreatedAt,
            likesInfo: {
                "likesCount": 0,
                "dislikesCount": 1,
                "myStatus": LikeStatusesEnum.Dislike
            }
        }
        expect(getNewCommentStatus2.body).toMatchObject(expectedComment2)

        const likeNewComment3 = await updateCommentLikeStatus(createAll.newCommentId, createAll.createdUserAccessToken, LikeStatusesEnum.None)
        expect(likeNewComment3.status).toBe(204)

        const getNewCommentStatus3 = await getNewCommentWithLike(createAll.newCommentId, createAll.createdUserAccessToken)
        expect(getNewCommentStatus3.status).toBe(200)

        const expectedComment3 = {
            id: createAll.newCommentId,
            content: createAll.newCommentContent,
            commentatorInfo: {
                userId: createAll.newCommentUserId,
                userLogin: createAll.newCommentUserLogin,
            },
            createdAt: createAll.newCommentCreatedAt,
            likesInfo: {
                "likesCount": 0,
                "dislikesCount": 0,
                "myStatus": LikeStatusesEnum.None
            }
        }
        expect(getNewCommentStatus3.body).toMatchObject(expectedComment3)

    })


    it(' like the comment by user 1 then get by user 2; ' +
        'dislike the comment by user 2 then get by the user 1', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const likeNewComment = await updateCommentLikeStatus(createAll.newCommentId,
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)
        expect(likeNewComment.status).toBe(204)

        const createdUser2 = await createUser2()

        const getNewCommentStatusBy2 = await getNewCommentWithLike(createAll.newCommentId, createdUser2.createdUserAccessToken)
        expect(getNewCommentStatusBy2.status).toBe(200)

        const expectedCommentBy2 = {
            id: createAll.newCommentId,
            content: createAll.newCommentContent,
            commentatorInfo: {
                userId: createAll.newCommentUserId,
                userLogin: createAll.newCommentUserLogin,
            },
            createdAt: createAll.newCommentCreatedAt,
            likesInfo: {
                "likesCount": 1,
                "dislikesCount": 0,
                "myStatus": LikeStatusesEnum.None
            }
        }
        expect(getNewCommentStatusBy2.body).toMatchObject(expectedCommentBy2)

        const getAllComments = await getAllCommentsOfPost(createAll.newPostId, createAll.createdUserAccessToken)
        expect(getAllComments.status).toBe(200)

    })


    it(' when try to like comment: should return error ' +
        'if :id from uri param not found; status 404;', async () => {
        const createAll = await createBlogPostUserLoginComment()


        const likeNewComment = await updateCommentLikeStatus("111",
            createAll.createdUserAccessToken, LikeStatusesEnum.Like)

        expect(likeNewComment.status).toBe(404)
    })


    it(' when try to like comment: should return error ' +
        'if :id from uri param not found; status 404;', async () => {

        const createAll = await createBlogPostUserLoginComment()

        const url = "/posts/" + createAll.newPostId + '/comments'
        const body = {content: commentContent}
        const auth = "Bearer" + " " + createAll.createdUserAccessToken

        const create6Comments = await createSeveralItems(6, url, body, auth)
        expect(create6Comments.length).toBe(6)

        const getAllCommentsForSpecialPost = await getCommentsWithPagination("sortBy=createdAt",
            "sortDirection=asc", "pageNumber=2", "pageSize=3", createAll.newPostId)
        expect(getAllCommentsForSpecialPost.status).toBe(200)

        //console.log(getAllCommentsForSpecialPost.body)

        const expectedComment = {
            id: createAll.newCommentId,
            content: createAll.newCommentContent,
            commentatorInfo: {
                userId: createAll.newCommentUserId,
                userLogin: createAll.newCommentUserLogin,
            },
            createdAt: createAll.newCommentCreatedAt,
            likesInfo: {
                "likesCount": 0,
                "dislikesCount": 0,
                "myStatus": LikeStatusesEnum.None
            }
        }

        expect(getAllCommentsForSpecialPost.body.items[0]).toStrictEqual(expectedComment)

    })
})
