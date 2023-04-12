
import request from 'supertest';
import {app} from "../src/settings";

import {client, mongoUri} from "../src/repositories/db";
import {
    createNewPassword,
    createUser,
    deleteAllCreateUser, fiveRequests, loginInSystem,
    passwordRecovery, waitSomeSeconds
} from "../src/functions/tests-functions";
import {
    basicAuth, myEmail, myLogin, myPassword,
    newPassword, secondEmail
} from "../src/functions/tests-objects";
import {usersQueryRepositories} from "../src/repositories/users-query-repositories";
import mongoose from "mongoose";

describe('Password Recovery', () => {

    jest.setTimeout(3*60*1000)

    beforeAll(async () => {
        await client.connect()
        await mongoose.connect(mongoUri)
        await request(app).delete('/testing/all-data')
    })

    afterAll(async () => {
        await client.connect()
        await mongoose.connection.close();
    })

    /*beforeEach(async () => {
        await request(app).delete('/testing/all-data')
    })*/

    it('/auth/new-password, create new password, all ok, status 204', async () => {

        const createNewUser = await createUser(myLogin, myPassword, myEmail, basicAuth)

        jest.mock('../src/managers/emails-manager', () => {
            return {
                emailsManager: {
                    sendEmailPasswordRecovery: jest.fn(() => Promise.resolve('Mock email sent successfully'))
                }
            }
        });

        const sendPasswordRecovery = await passwordRecovery(myEmail)
        expect(sendPasswordRecovery.status).toBe(204)

        const userFromDb = await usersQueryRepositories.findUserByLoginOrEmail(null, myEmail)
        expect(userFromDb).not.toBeNull()

        const recoveryCode = userFromDb!.passwordRecovery.recoveryCode
        expect(recoveryCode).not.toBeNull()

        const authNewPassword = await createNewPassword(newPassword, recoveryCode)
        expect(authNewPassword.status).toBe(204)

    })

    it('auth/password-recovery, status 204 even if such email doesnt exist', async () => {

        const sendPasswordRecovery = await passwordRecovery(secondEmail)
        expect(sendPasswordRecovery.status).toBe(204)

        const userFromDb = await usersQueryRepositories.findUserByLoginOrEmail(null, secondEmail)
        expect(userFromDb).toBeNull()

    })

    it('/auth/login, status 401 if try to login with old password', async () => {

        const sendPasswordRecovery = await passwordRecovery(myEmail)

        const userFromDb = await usersQueryRepositories.findUserByLoginOrEmail(null, myEmail)
        expect(userFromDb).not.toBeNull()

        const recoveryCode = userFromDb!.passwordRecovery.recoveryCode
        expect(recoveryCode).not.toBeNull()

        const sendNewPassword = await createNewPassword(newPassword, recoveryCode!)
        expect(sendNewPassword.status).toBe(204)

        const login = await loginInSystem(myEmail, myPassword)
        expect(login.status).toBe(401)

    })


    it('/auth/login should sign in user with new password; status 200; content: JWT token', async () => {

        const login = await loginInSystem(myEmail, newPassword)
        expect(login.status).toBe(200)

        const myCookies = login.headers['set-cookie'][0]

        expect(login.body).toMatchObject({
            "accessToken": expect.any(String)
        });

        expect(myCookies).toBeDefined()

    })

    it('auth/new-password: should return error if password is incorrect; status 400;', async () => {

        //const newUser = await deleteAllCreateUser(myLogin, myPassword, myEmail, basicAuth)

        const sendPasswordRecovery = await passwordRecovery(myEmail)

        const userFromDb = await usersQueryRepositories.findUserByLoginOrEmail(null, myEmail)
        expect(userFromDb).not.toBeNull()

        const recoveryCode = userFromDb!.passwordRecovery.recoveryCode
        expect(recoveryCode).not.toBeNull()

        const sendNewPassword = await createNewPassword(" ", recoveryCode!)
        expect(sendNewPassword.status).toBe(400)

    })

    it('auth/password-recovery, status 429 if more than 5 requests were sent within 10 seconds, and 204 after waiting;', async () => {

        const send5Requests = await fiveRequests ("/auth/password-recovery/", {email: myEmail})

        // Check that the last request was rate-limited
        expect(send5Requests).toBe(429);

        const wait = await waitSomeSeconds(10)

        const sendPasswordRecovery = await passwordRecovery(myEmail)
        expect(sendPasswordRecovery.status).toBe(204)

    })

    it('auth/new-password, status 429 if more than 5 requests were sent within 10 seconds, and 204 after waiting;', async () => {

        const newUser = await deleteAllCreateUser(myLogin, myPassword, myEmail, basicAuth)

        const sendPasswordRecovery = await passwordRecovery(myEmail)

        const userFromDb = await usersQueryRepositories.findUserByLoginOrEmail(null, myEmail)
        expect(userFromDb).not.toBeNull()

        const recoveryCode = userFromDb!.passwordRecovery.recoveryCode
        expect(recoveryCode).not.toBeNull()

        const send5Requests = await fiveRequests ("/auth/new-password/", {newPassword: myPassword, recoveryCode: recoveryCode})

        // Check that the last request was rate-limited
        expect(send5Requests).toBe(429);

        const wait = await waitSomeSeconds(8)

        const sendPasswordRecovery2 = await passwordRecovery(myEmail)

        const userFromDb2 = await usersQueryRepositories.findUserByLoginOrEmail(null, myEmail)
        expect(userFromDb2).not.toBeNull()

        const recoveryCode2 = userFromDb2!.passwordRecovery.recoveryCode
        expect(recoveryCode2).not.toBeNull()

        const sendNewPassword = await createNewPassword("\"myPassword\"+1", recoveryCode2!)
        expect(sendNewPassword.status).toBe(204)

    })

})