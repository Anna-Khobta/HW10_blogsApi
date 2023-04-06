
import request from 'supertest';
import {app} from "../src/settings";

import {MailBoxImap} from "../src/application/imap.service"
import {createUser, deleteAllCreateUser} from "../src/functions/tests-functions";
import {emitKeypressEvents} from "readline";




const auth = {login: 'admin', password: 'qwerty'}

describe('Password Recovery', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    it('should send email with recovery code', async () => {
        // Simulate a request to your API endpoint that calls sendEmailPasswordRecovery

        const createdResponseUser = await request(app)
            .post('/users')
            .set('Authorization', `Basic ${Buffer.from(`${auth.login}:${auth.password}`).toString('base64')}`)
            .send({
                "login": "test12",
                "password": "test12",
                "email": "ana14i88@yandex.ru"
            })
            .expect(201)

        const createdUser = createdResponseUser.body

        console.log(createdUser)

        const res = await request(app)
            .post('/auth/password-recovery')
            .send({email: 'ana14i88@yandex.ru'})
            .expect(204);


        const mailBox: MailBoxImap = expect.getState().mailBox

        const email = await mailBox.waitNewMessage(2);
        const html = await mailBox.getMessageHtml(email)

        expect(html).not.toBeNull()

/*
        const subject = await mailBox.getMessageSubject(message);

        const recoveryCodeRegex = /Your recovery code is ([a-zA-Z0-9]+)/;
        // @ts-ignore
        const recoveryCodeMatch = recoveryCodeRegex.exec(await mailbox.getMessageHtml(message));
        if (subject !== 'Password Recovery' || !recoveryCodeMatch) {
            throw new Error('Did not receive expected recovery email');
        }
        const recoveryCode = recoveryCodeMatch[1];*/
    })
})

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
