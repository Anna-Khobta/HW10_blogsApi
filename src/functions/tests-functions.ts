import express from "express";
import request from "supertest";
import {basicAuth, blogNameDescriptionUrl, loginOrEmailPassw} from "./tests-objects";
import {app} from "../settings";



// 🌺🌺🌺 BLOGS

export const createBlog = async (blogName: string, blogDescription: string, blogUrl: string) => {

    return request(app)
        .post('/blogs')
        .set('Authorization', basicAuth)
        .send({
            "name": blogName,
            "description": blogDescription,
            "websiteUrl": blogUrl
    })
}







// 🌺🌺🌺 POSTS

export const createPost = async (title: string, shortDescription: string, content: string, blogId:string ) => {

    return request(app)
        .post('/posts')
        .set('Authorization', basicAuth)
        .send({
        "title": title,
        "shortDescription": shortDescription,
        "content": content,
        "blogId": blogId
        })
}

export const getPostById = async (id:string|null) => {
    return request(app)
        .get('/posts/' + id)
}


export const getPostsWithPagination = async (sortBy:string|null,
                                             sortDirection: string|null,
                                             pageNumber: string|null,
                                             pageSize: string|null) => {

    return request(app)
        .get('/posts/' + '?'+ sortBy + '&'+sortDirection +'&'+ pageNumber + '&'+ pageSize)
}

export const updatePost = async (title: string, shortDescription: string, content: string, blogId:string, postId: string ) => {

    return request(app)
        .put('/posts/' + postId)
        .set('Authorization', basicAuth)
        .send({
            "title": title,
            "shortDescription": shortDescription,
            "content": content,
            "blogId": blogId
        })
}

export const deletePostById = async (id: string|null ) => {
    return request(app)
        .delete('/posts/' + id)
        .set('Authorization', basicAuth)
}





// 🌺🌺🌺 POSTS2

export async function createPostWithBlog (app: express.Application)
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



// 🌺🌺🌺 USERS

export async function createUser (login:string, password: string, email: string, basicAuth: string) {
    return request(app)
        .post('/users')
        .set('Authorization', basicAuth)
        .send({    "login": login,
            "password": password,
            "email": email})
}

export const getUsersWithPagination = async (sortBy:string|null, sortDirection: string|null, pageNumber: string|null, pageSize: string|null, searchLoginTerm:string|null, searchEmailTerm:string|null) => {

    return request(app)
    .get('/users/' + '?'+ sortBy + '&'+sortDirection +'&'+ pageNumber + '&'+ pageSize + '&'+ searchLoginTerm + '&'+ searchEmailTerm)
    .set('Authorization', basicAuth)
}

export async function deleteAllCreateUser (login:string, password: string, email: string, basicAuth: string) {

    const deleteAll = await request(app)
        .delete('/testing/all-data')
        .expect(204)

    return request(app)
        .post('/users')
        .set('Authorization', basicAuth)
        .send({    "login": login,
            "password": password,
            "email": email})
}

// 🌺🌺🌺 DEVICES

export const getAllUserDevices = async (cookies: any) => {
    return  request(app)
        .get("/security/devices")
        .set('Cookie', cookies)
}

export const deleteByDeviceId = async (deviceId: string|null|number, cookies:any) => {
    return request(app)
        .delete("/security/devices/" + deviceId)
        .set('Cookie', cookies)
}


// 🌺🌺🌺 AUTH

export async function loginUserGetToken (app: express.Application) {

    const tryLogin = await request(app)
        .post('/auth/login')
        .send(loginOrEmailPassw)
        .expect(200)

    return tryLogin.body.accessToken
}

export const authRegistarion = (login:string, password: string, email: string) => {
    return request(app)
        .post("/auth/registration/")
        .send(    {"login": login,
        "password": password,
        "email": email})
}


export async function loginInSystem3 (app: express.Application): Promise <string>  {

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

export const authRefreshToken = (refreshToken: string) => {
    return request(app)
        .post("/auth/refresh-token")
        .set('Cookie', refreshToken)
}

export const passwordRecovery = async (email: any) => {
    return request(app)
        .post('/auth/password-recovery')
        .send({email: email})
}

export const createNewPassword = async <T>(password: any, recoveryCode: any): Promise<{body: T, status: number}> => {

    const result = await request(app)
        .post('/auth/new-password')
        .send({
                "newPassword": password,
                "recoveryCode": recoveryCode
            }
        )

    return {
        body: result.body,
        status: result.status
    }
}


export const loginInSystem = async (loginOrEmail: any, password: any) => {

    return request(app)
        .post('/auth/login')
        .send({
            "loginOrEmail": loginOrEmail,
            "password": password
        })
}




// 🌺🌺🌺 OTHER

export const fiveRequests = async (url: string, someBody: any) => {

    const maxRequests = 5;
    const requests = [];

    // Send more than `maxRequests` requests within `interval` time
    for (let i = 0; i <= maxRequests; i++) {
        requests.push(
            request(app)
                .post(url)
                .set('Authorization', basicAuth)
                .send(someBody)
        );
    }

    // Wait for all requests to complete
    const responses = await Promise.all(requests);

    return responses[maxRequests].status
}

export const createSeveralItems = async (numberTimes: number, url: string, someBody: any) => {

    let items = []

    for (let i = 0; i < numberTimes; i++) {
        const createResponse = await request(app)
            .post(url)
            .set('Authorization', basicAuth)
            .send(
                someBody
            )
        items.push(createResponse.body)
    }
    return items
}

export const waitSomeSeconds = async (seconds: number) => {

    const interval = seconds * 1000; // in milliseconds
    await new Promise(resolve => setTimeout(resolve, interval));

}

export const clearAllDb = async () => {
    await request(app).delete('/testing/all-data')
}