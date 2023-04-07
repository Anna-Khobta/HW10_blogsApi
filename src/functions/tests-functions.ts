import express from "express";
import request from "supertest";
import {basicAuth, blogNameDescriptionUrl, loginOrEmailPassw, unregisteredEmail, userLoginPassEmail} from "./tests-objects";
import {app} from "../settings";


export async function createPostWithBlog (app: express.Application, auth: {login: string, password: string})
{
    const createdResponseBlog = await request(app)
        .post('/blogs')
        .set('Authorization', basicAuth)
        .send(blogNameDescriptionUrl)
        .expect(201);
    const createdBlog = createdResponseBlog.body;

    const createdResponsePost = await request(app)
        .post('/posts')
        .set('Authorization', basicAuth)
        .send({
            "title": "1post title",
            "shortDescription": "1post string",
            "content": "1post string",
            "blogId": createdBlog.id
        })
        .expect(201);

    return createdResponsePost.body;
}

export async function createUser (app: express.Application) {
    const createdResponseUser = await request(app)
        .post('/users')
        .set('Authorization', basicAuth)
        .send(userLoginPassEmail)
        .expect(201)

    return createdResponseUser.body;
}

export async function loginUserGetToken (app: express.Application, auth: {login: string, password: string}) {

    const tryLogin = await request(app)
        .post('/auth/login')
        .send(loginOrEmailPassw)
        .expect(200)

    return tryLogin.body.accessToken
}

export async function deleteAllCreateUser () {

    const deleteAll = await request(app)
        .delete('/testing/all-data')
        .expect(204)

    const createdUser = await request(app)
        .post('/users')
        .set('Authorization', basicAuth)
        .send(userLoginPassEmail)
        .expect(201)

    return createdUser.body
}


export async function loginInSystem (app: express.Application): Promise <string>  {

   const login = await request(app)
        .post('/auth/login')
        .send(loginOrEmailPassw)
        .expect(200)

    const myCookies = login.headers['set-cookie'][0]

    expect(login.body).toMatchObject({
        "accessToken": expect.any(String)
    });

    expect(myCookies).toBeDefined()

    return myCookies
}

export const passwordRecovery = async (email: any) => {
    return request(app)
        .post('/auth/password-recovery')
        .send(email)
}

const newPassword = "newPassword"

export const createNewPassword = async (password: string, recoveryCode: string) => {

    return request(app)
        .post('/auth/new-password')
        .send({
                "newPassword": password,
                "recoveryCode": recoveryCode
            }
        )
}


export const loginInSystem2 = async (loginOrEmailPassw: any) => {

    return request(app)
        .post('/auth/login')
        .send(loginOrEmailPassw)
}
