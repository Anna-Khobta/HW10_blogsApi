import {app} from "../src/settings";
import request from "supertest"
import {BlogType} from "../src/repositories/db/types";
import {
    authLogin,
    authMe,
    clearAllDb,
    createBlog,
    createComment,
    createPost,
    createSeveralItems,
    createUser,
    deleteComment,
    getBlogById,
    getBlogsWithPagination,
    getCommentById,
    getCommentsWithPagination, getNewCommentWithLike,
    updateComment, updateCommentLikeStatus
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
    commentContent, likeStatusisDisLike,
    likeStatusisLike,
    myEmail,
    myLogin,
    myLoginOrEmail,
    myPassword, newPassword,
    postContent,
    postNewContent,
    postNewShortDescription,
    postNewTitle,
    postShortDescription,
    postTitle, secondEmail,
    secondLogin, secondLoginOrEmail
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

        console.log(createdUserAccessToken)

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
            createdAt: expect.any(String)
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
        const body = {content : commentContent}
        const auth = "Bearer" + " " + loginMyUser.body.accessToken

        const create13Comments = await createSeveralItems(13, url, body, auth)
        expect(create13Comments.length).toBe(13)

        const expectedComment = {
            id: expect.any(String),
            content: expect.any(String),
            commentatorInfo: {
                userId: createNewUser.body.id,
                userLogin: createNewUser.body.login },
            createdAt: expect.any(String) }

        expect(create13Comments[1]).toMatchObject(expectedComment)

const getAllCommentsForSpecialPost = await getCommentsWithPagination("sortBy=createdAt",
    "sortDirection=asc", "pageNumber=2" , "pageSize=3", createNewPost.body.id )
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

        const updateNewComment = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken, likeStatusisLike)
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
                "myStatus": likeStatusisLike
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

        const updateNewComment2 = await updateCommentLikeStatus(createNewComment.body.id, createdUserAccessToken2, likeStatusisDisLike)
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
                "myStatus": likeStatusisDisLike
            }
        }

        expect(getNewComment2.body).toMatchObject(expectedComment2)
    })


})



