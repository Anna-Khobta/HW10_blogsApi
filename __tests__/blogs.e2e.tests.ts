import request from "supertest";
import {app} from "../src/settings";
import {createBlog} from "../src/functions/tests-functions";
import {
    blogDescription,
    blogName, blogUrl
} from "../src/functions/tests-objects";
import mongoose from "mongoose";

describe('Blogs', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    afterAll(async () => {
        await mongoose.connection.close();
    })

    it('POST /blogs, create new blog; status 201', async () => {

        const createNewBlog = await createBlog(blogName, blogDescription, blogUrl)
        expect(createNewBlog.status).toBe(201)

        expect(createNewBlog.body).toMatchObject({
            "id": expect.any(String),
            "name": expect.any(String),
            "description": expect.any(String),
            "websiteUrl": expect.any(String),
            "createdAt": expect.any(String),
            "isMembership": true
        });

        expect(createNewBlog.body.createdAt).toMatch(/^20\d{2}(-[01]\d){2}T([0-2]\d):[0-5]\d:[0-5]\d\.\d{3}Z$/)

    })
})
