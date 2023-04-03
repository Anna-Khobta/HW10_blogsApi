import express from "express";
import request from "supertest";

export async function createPostWithBlog (app: express.Application, auth: {login: string, password: string}) {
    const createdResponseBlog = await request(app)
        .post('/blogs')
        .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
        .send({
            "name": "Anna1",
            "description": "1 description",
            "websiteUrl": "1google.com"
        })
        .expect(201);
    const createdBlog = createdResponseBlog.body;

    const createdResponsePost = await request(app)
        .post('/posts')
        .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
        .send({
            "title": "1post title",
            "shortDescription": "1post string",
            "content": "1post string",
            "blogId": createdBlog.id
        })
        .expect(201);

    return createdResponsePost.body;
}

export async function createUser (app: express.Application, auth: {login: string, password: string}) {
    const createdResponseUser = await request(app)
        .post('/users')
        .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
        .send({
            "login": "test123",
            "password": "test123",
            "email": "test123@mail.com"
        })
        .expect(201)

    return createdResponseUser.body;
}

export async function loginUserGetToken (app: express.Application, auth: {login: string, password: string}) {

    const tryLogin = await request(app)
        .post('/auth/login')
        .send({
            "loginOrEmail": "test123",
            "password": "test123"
        })
        .expect(200)

    return tryLogin.body.accessToken
}

export async function deleteAllCreateUser (app: express.Application, auth: {login: string, password: string}) {

    const deleteAll = await request(app)
        .delete('/testing/all-data')
        .expect(204)

    const createdUser = await request(app)
        .post('/users')
        .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
        .send({
            "login": "Anna12",
            "password": "Anna12",
            "email": "Anna12@mail.com"
        })
        .expect(201)

    return createdUser.body
}


export async function loginInSystem (app: express.Application, auth: {login: string, password: string}): Promise <string>  {

   const login = await request(app)
        .post('/auth/login')
        .send({
            "loginOrEmail": "Anna12",
            "password": "Anna12"
        })
        .expect(200)

    const myCookies = login.headers['set-cookie'][0]

    expect(login.body).toMatchObject({
        "accessToken": expect.any(String)
    });

    expect(myCookies).toBeDefined()

    return myCookies

}

