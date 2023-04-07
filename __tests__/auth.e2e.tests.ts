
import request from 'supertest';
import {app} from "../src/settings";

import {client} from "../src/repositories/db";
import {usersRepository} from "../src/repositories/users-db-repositories";

import {
    createNewPassword,
    createUser,
    deleteAllCreateUser,
    loginInSystem2,
    passwordRecovery
} from "../src/functions/tests-functions";
import {
    email,
    loginOrEmailPassw,
    newPassword,
    unregisteredEmail,
    userLoginPassEmail
} from "../src/functions/tests-objects";

describe('Password Recovery', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    afterAll(async () => {
        await client.close();
    })

    it('should send email with recovery code and create new-password', async () => {

        const newUser = await createUser(app)

        const passwordRecoveryRes = await request(app)
            .post('/auth/password-recovery')
            .send(email)
            .expect(204);

        jest.mock('../src/managers/emails-manager', () => {
            return {
                emailsManager: {
                    sendEmailPasswordRecovery: jest.fn(() => Promise.resolve('Mock email sent successfully'))
                }
            }
        });

        const userFromDb = await usersRepository.findUserByEmail(email.email)

        expect(userFromDb).not.toBeNull()

        const recoveryCode = userFromDb!.passwordRecovery.recoveryCode

        expect(recoveryCode).not.toBeNull()

        const createNewPassword = await request(app)
            .post('/auth/new-password')
            .send({
                    "newPassword": "newPassword",
                    "recoveryCode": recoveryCode
                }
            )
            .expect(204);


    })

    it('auth/password-recovery: should return status 204 even if such email doesnt exist', async () => {

        const newUser = await deleteAllCreateUser()

        const passwordRecoveryRes = await passwordRecovery(unregisteredEmail)

        expect(passwordRecoveryRes.status).toBe(204)

        const userFromDb = await usersRepository.findUserByEmail(unregisteredEmail.email)

        expect(userFromDb).toBeNull()

    })

    it('POST -> "/auth/login": status 401 if try to login with old password', async () => {

        const newUser = await deleteAllCreateUser()

        const passwordRecoveryRes = await passwordRecovery(email)

        const userFromDb = await usersRepository.findUserByEmail(email.email)
        expect(userFromDb).not.toBeNull()

        const recoveryCode = userFromDb!.passwordRecovery.recoveryCode
        expect(recoveryCode).not.toBeNull()

        const resOldPassword = await createNewPassword(newPassword, recoveryCode!)

        const login = await loginInSystem2(loginOrEmailPassw)

        expect(login.status).toBe(401)


    })

})