import {app} from "../src/settings";
import request from "supertest"
import {BlogType, CommentViewType} from "../src/repositories/types";
import {createPostWithBlog, createUser, loginUserGetToken} from "../src/functions/tests-functions";



const auth = {login: 'admin', password: 'qwerty'}

describe.skip('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    it('Post, blog, with authorization', async () => {

        const createdResponse = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
            .send({
                "name": "anna",
                "description": "1 description",
                "websiteUrl": "1google.com"
            })
            .expect(201)

        const createdBlog = createdResponse.body

        const expectedBlog = {
            id: expect.any(String),
            name: "anna",
            description: "1 description",
            websiteUrl: "1google.com",
            "createdAt": createdBlog.createdAt,
            isMembership: false
        }

        expect(createdBlog).toEqual(expectedBlog)


        const getResponse = await request(app)
            .get('/blogs/' + createdBlog.id)
            .expect(200).send(createdBlog)


    })
})

describe.skip('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    it('Get, 10 blogs, with pagination', async () => {

        await request(app).delete('/testing/all-data')

        let blogs: BlogType[] = []

        for (let i = 0; i < 10; i++) {
            const createdResponse1 = await request(app)
                .post('/blogs')
                .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
                .send({
                    "name": "Anna",
                    "description": "1 description",
                    "websiteUrl": "1google.com"
                })
            blogs.push(createdResponse1.body)
        }

        await request(app)
            .get('/blogs?' + 'sortDirection=asc' + '&pageSize=20' + '&page=2')
            .expect(200, {
                "pagesCount": 1,
                "page": 1,
                "pageSize": 20,
                "totalCount": blogs.length,
                "items": blogs
            })
    })
})

describe('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

       it('create blog and post, create user, login user, auth with token', async () => {

        const createdResponseBlog = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
            .send({
                "name": "Anna",
                "description": "1 description",
                "websiteUrl": "1google.com"
            })
            .expect(201)

        const createdBlog = createdResponseBlog.body

        const expectedBlog = {
            id: expect.any(String),
            name: "Anna",
            description: "1 description",
            websiteUrl: "1google.com",
            createdAt: createdBlog.createdAt,
            isMembership: false
        }

        expect(createdBlog).toEqual(expectedBlog)


        const createdResponsePost = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
            .send({
                "title": "post title",
                "shortDescription": "post string",
                "content": "post string",
                "blogId": createdBlog.id
            })
            .expect(201)

        const createdPost = createdResponsePost.body

        const expectedPost = {
            id: expect.any(String),
            title: "post title",
            shortDescription: "post string",
            content: "post string",
            blogId: createdBlog.id,
            blogName: createdBlog.name,
            createdAt: createdPost.createdAt
        }

        expect(createdPost).toEqual(expectedPost)


        const createdResponseUser = await request(app)
            .post('/users')
            .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
            .send({
                "login": "test12",
                "password": "test12",
                "email": "test12@mail.com"
            })
            .expect(201)

        const createdUser = createdResponseUser.body

        const expectedUser = {
            id: expect.any(String),
            login: "test12",
            email: "test12@mail.com",
            createdAt: createdUser.createdAt
        }

        expect(createdUser).toEqual(expectedUser)


        const tryLogin = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "test12",
                "password": "test12"
            })
            .expect(200)


        let createdUserToken = tryLogin.body.accessToken
        expect(createdUserToken).not.toBeUndefined()


        // Send a request to a test route with the token in the Authorization header
        const responseGetInformation = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${createdUserToken}`)
            .expect(200)

        const authMeResult = responseGetInformation.body

        const authMeExpected = {
            email: createdUser.email,
            login: createdUser.login,
            userId: createdUser.id
        }

        expect(authMeResult).toEqual(authMeExpected)

    }),

       it('create comment', async () => {

           const createdPost = await createPostWithBlog(app, auth);
           let postId = createdPost.id

           const createdUser = await createUser(app,auth)

           const userToken = await loginUserGetToken(app,auth)


            const responseGetInformation = await request(app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200)
            const authMeResult = responseGetInformation.body

            const createdResponseComment = await request(app)
                .post('/posts/' + postId + '/comments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    "content": "stringstringstringstringstring"
                })
                .expect(201)

            const createdComment = createdResponseComment.body

            const expectedComment = {
                id: expect.any(String),
                content: "stringstringstringstringstring",
                commentatorInfo: {
                    userId: createdUser.id,
                    userLogin: createdUser.login
                },
                createdAt: createdComment.createdAt
            }

            expect(createdComment).toEqual(expectedComment)


        }),

       it('update comment, than delete comment', async () => {

           const deleteAll = await request(app)
               .delete('/testing/all-data')
               .expect(204)

           const createdPost = await createPostWithBlog(app, auth);
           let postId = createdPost.id

           const createdUser = await createUser(app,auth)

           const userToken = await loginUserGetToken(app,auth)

           const responseGetInformation = await request(app)
               .get('/auth/me')
               .set('Authorization', `Bearer ${userToken}`)
               .expect(200)
           const authMeResult = responseGetInformation.body

           const createdResponseComment = await request(app)
               .post('/posts/' + postId + '/comments')
               .set('Authorization', `Bearer ${userToken}`)
               .send({
                   "content": "stringstringstringstringstring"
               })
               .expect(201)

           const createdComment = createdResponseComment.body

           const expectedComment = {
               id: expect.any(String),
               content: "stringstringstringstringstring",
               commentatorInfo: {
                   userId: createdUser.id,
                   userLogin: createdUser.login
               },
               createdAt: createdComment.createdAt
           }

           expect(createdComment).toEqual(expectedComment)

           let commentId = createdComment.id

           const updateResponseComment = await request(app)
               .put('/comments/' + commentId)
               .set('Authorization', `Bearer ${userToken}`)
               .send({
                   "content": "updated stringstringstringstringstring"
               })
               .expect(204)

           const deleteResponseComment = await request(app)
               .delete('/comments/' + commentId)
               .set('Authorization', `Bearer ${userToken}`)
               .expect(204)


       })

})

describe('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    // return comments for special post
    it('return comments for special post with pagination', async () => {

        const createdPost = await createPostWithBlog(app, auth);
        let postId = createdPost.id

        const createdUser = await createUser(app,auth)

        const tryLogin = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "test123",
                "password": "test123"
            })
            .expect(200)
        let createdUserToken = tryLogin.body.accessToken

        const responseGetInformation = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${createdUserToken}`)
            .expect(200)
        const authMeResult = responseGetInformation.body

            let comments: CommentViewType[] = []
            for (let i = 0; i < 13; i++) {
                const createdResponseComment = await request(app)
                    .post('/posts/' + postId + '/comments')
                    .set('Authorization', `Bearer ${createdUserToken}`)
                    .send({
                        "content": "stringstringstringstringstring"
                    })
                comments.push(createdResponseComment.body)
            }

        await request(app)
            .get('/posts/'+ postId + '/comments/' + '?'+ 'sortDirection=asc'+ '&pageSize=20'+ '&page=2')
            .expect(200,{
                "pagesCount": 1,
                "page": 1,
                "pageSize": 20,
                "totalCount": comments.length,
                "items": comments
            })
    })

})
