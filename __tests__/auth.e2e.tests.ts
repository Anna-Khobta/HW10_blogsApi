
import request from 'supertest';
import {app} from "../src/settings";

import {client} from "../src/repositories/db";
import {usersRepository} from "../src/repositories/users-db-repositories";

import {createUser, deleteAllCreateUser} from "../src/functions/tests-functions";


const email = {email: 'nakanai.x@gmail.com'}
const unAuthEmail = {email: 'ana14i88@gmail.com'}

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

        const newUser = await deleteAllCreateUser(app)

        const passwordRecoveryRes = await request(app)
            .post('/auth/password-recovery')
            .send(unAuthEmail)
            .expect(204);

        jest.mock('../src/managers/emails-manager', () => {
            return {
                emailsManager: {
                    sendEmailPasswordRecovery: jest.fn(() => Promise.resolve('Mock email sent successfully'))
                }
            }
        })

        const userFromDb = await usersRepository.findUserByEmail(unAuthEmail.email)

        expect(userFromDb).toBeNull()



    })
})


/*

        const mailBox: MailBoxImap = expect.getState().mailBox


        const email = await mailBox.waitNewMessage(2);
        const html = await mailBox.getMessageHtml(email)

        expect(html).not.toBeNull()*/

/*
        const subject = await mailBox.getMessageSubject(message);

        const recoveryCodeRegex = /Your recovery code is ([a-zA-Z0-9]+)/;
        // @ts-ignore
        const recoveryCodeMatch = recoveryCodeRegex.exec(await mailbox.getMessageHtml(message));
        if (subject !== 'Password Recovery' || !recoveryCodeMatch) {
            throw new Error('Did not receive expected recovery email');
        }
        const recoveryCode = recoveryCodeMatch[1];*/

        /*const email = await mailbox.getLastMessageBySubject("Recovery");

         console.log(email)*/

        /*const recoveryCode = /code=(.*)/.exec(email.html)[1]

        // Assert that the recovery code is a string
        expect(typeof recoveryCode).toBe('string');

        // Assert that the recovery code matches the one in the response
        expect(recoveryCode).toBe(res.body.code);*/
/*
    });
});*/
