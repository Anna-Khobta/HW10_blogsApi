import {client} from "../src/repositories/db";
import {
    clearAllDb,
    createBlog,
    createPost, createSeveralItems, deletePostById,
    getPostById,
    getPostsWithPagination, updatePost
} from "../src/functions/tests-functions";
import {
    basicAuth,
    blogDescription,
    blogName,
    blogUrl,
    postContent, postNewContent, postNewShortDescription, postNewTitle,
    postShortDescription,
    postTitle
} from "../src/functions/tests-objects";
import mongoose from "mongoose";
import {MongoClient} from "mongodb";

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
            "createdAt": expect.any(String)
        }

        expect(createNewPost.body).toMatchObject(expectedPost);

        expect(createNewPost.body.createdAt).toMatch(/^20\d{2}(-[01]\d){2}T([0-2]\d):[0-5]\d:[0-5]\d\.\d{3}Z$/)
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
            "blogId": createNewBlog.body.id}

        const create5Posts = await createSeveralItems(5,'/posts', postFullBody, basicAuth)

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
            "sortDirection=asc", "pageNumber=2" , "pageSize=3")
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

        const updateNewPost = await updatePost (postNewTitle, postNewShortDescription, postNewContent, createNewBlog.body.id, createNewPost.body.id )
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
            "sortDirection=asc", "pageNumber=2" , "pageSize=3")
        expect(getAllPostsWithPagination.status).toBe(200)

        expect(getAllPostsWithPagination.body.items.length).toBe(0)

    })
})