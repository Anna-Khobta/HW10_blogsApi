import {app} from "../src/settings";
import request from "supertest"
import {deleteAllCreateUser, loginInSystem, loginInSystem2} from "../src/functions/tests-functions";
import jwt from "jsonwebtoken";
import {auth, basicAuth, loginOrEmailPassw, userLoginPassEmail} from "../src/functions/tests-objects";



describe('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    it('POST -> "/users": should create new user; status 201; ' +
        'used additional methods: GET => /users;', async () => {

        const createdResponseUser = await request(app)
            .post('/users')
            .set('Authorization', basicAuth)
            .send(userLoginPassEmail)
            .expect(201)

        const createdUser = createdResponseUser.body

        const expectedUser = {
            id: expect.any(String),
            login: "test12",
            email: "test12@mail.com",
            createdAt: createdUser.createdAt
        }

        expect(createdUser).toEqual(expectedUser)

        const users = []
        users.push(createdUser)

        const getUser = await request(app)
            .get('/users/' + '?'+ 'sortDirection=asc'+ '&pageSize=20'+ '&page=1')
            .set('Authorization', basicAuth)
            .expect(200, {
                "pagesCount": 1,
                "page": 1,
                "pageSize": 20,
                "totalCount": users.length,
                "items": users
            })
    }),

        it('GET -> "/security/devices": login user 1 time, then get device list; status 200; content: device list;' +
            'used additional methods: POST => /auth/login ', async () => {

            const login = await loginInSystem2(loginOrEmailPassw)

                expect(login.status).toBe(200)

            const myCookies = login.headers['set-cookie'][0]

            expect(login.body).toMatchObject({
                "accessToken": expect.any(String)
            });

            expect(myCookies).toBeDefined()


            const getAllUserDevices = await request(app)
                .get("/security/devices")
                .set('Cookie', myCookies)
                .expect(200)

            const expectedDevices = [{
                        ip: expect.any(String),
                        title: expect.any(String),
                        lastActiveDate: expect.any(String),
                        deviceId: expect.any(String)
                    }]

            expect(getAllUserDevices.body).toEqual(expectedDevices)

        }),


        it("DELETE /security/devices/:deviceId: " +
            " error 404, error 401 ", async () => {

            const loginInSystem = await request(app)
                .post('/auth/login')
                .send({
                    "loginOrEmail": "test12",
                    "password": "test12"
                })
                .expect(200)

            const myCookies = loginInSystem.headers['set-cookie'][0]

            const incorrectDeviceId = 123

            const deleteByDeviceId404 = await request(app)
                .delete("/security/devices/" + incorrectDeviceId)
                .set('Cookie', myCookies)
                .expect(404)

            const deleteByDeviceId401 = await request(app)
                .delete("/security/devices/" + incorrectDeviceId)
                .expect(401)

        })

})



describe('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    it('GET -> "/security/devices": login user 4 times from different browsers;' +
        'used additional methods: POST => /auth/login ', async () => {

        const deleteAll = await request(app)
            .delete('/testing/all-data')
            .expect(204)

        const createdUser = await request(app)
            .post('/users')
            .set('Authorization', basicAuth)
            .send(userLoginPassEmail)
            .expect(201)

        await new Promise(resolve => setTimeout(resolve, 5000));

        const browsers = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36'];

        let myCookies = []

        for (let i = 0; i < browsers.length; i++) {
            const loginRes = await request(app)
                .post('/auth/login')
                .send({
                    loginOrEmail: 'Anna12',
                    password: 'Anna12'
                })
                .set('User-Agent', browsers[i])
                .expect(200);

            myCookies.push(loginRes.headers['set-cookie']);
        }

        const devicesRes = await request(app)
            .get("/security/devices")
            .set('Cookie', myCookies)
            .expect(200)

        expect(devicesRes.body.length).toBeGreaterThan(0);
        expect(devicesRes.body).toHaveLength(4);

        devicesRes.body.forEach((device: any) => {
            expect(device).toEqual({
                deviceId: expect.any(String),
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                title: expect.any(String)
            });
            expect(device.lastActiveDate).toMatch(/^20\d{2}(-[01]\d){2}T([0-2]\d):[0-5]\d:[0-5]\d\.\d{3}Z$/);
        });
    }),


        it('POST -> "/auth/refresh-token": should return new refresh and access tokens; status 200', async () => {

            const newUser = await deleteAllCreateUser()
            const loginCookies = await loginInSystem(app)

            const generateTokensRes = await request(app)
                .post("/auth/refresh-token")
                .set('Cookie', loginCookies)
                .expect(200)

                const resAccessToken = generateTokensRes.body.accessToken
                const resRefreshToken = generateTokensRes.headers['set-cookie'][0].split(';')[0].split('=')[1]

            console.log(resRefreshToken)


            expect(typeof resAccessToken).toBe('string');
            expect(resRefreshToken).toBeDefined();

            // Verify if the accessToken is a valid JWT token
            const decodedAccessToken = jwt.decode(resAccessToken);
            const decodedRefreshToken = jwt.decode(resRefreshToken);

            expect(decodedAccessToken).toMatchObject({
                userId: expect.any(String),
                iat: expect.any(Number),
                exp: expect.any(Number)
            });

            expect(decodedRefreshToken).toMatchObject({
                userId: expect.any(String),
                deviceId: expect.any(String),
                iat: expect.any(Number),
                exp: expect.any(Number)
            });
        })
})

describe('/', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    it('more than 5 requests were sent within 10 seconds' +
        'status 204 after waiting', async () => {

        const maxRequests = 5;
        const requests = [];

        // Send more than `maxRequests` requests within `interval` time
        for (let i = 0; i <= maxRequests; i++) {
            requests.push(
                request(app)
                    .post("/auth/registration/")
                    .send(userLoginPassEmail)
            );
        }

        // Wait for all requests to complete
        const responses = await Promise.all(requests);

        // Check that the last request was rate-limited
        expect(responses[maxRequests].status).toBe(429);

        // wait for 10 seconds
        const interval = 10 * 1000; // in milliseconds
        await new Promise(resolve => setTimeout(resolve, interval));

        const registrationRes = await request(app)
            .post("/auth/registration/")
            .send(userLoginPassEmail)
            .expect(204)


    })
})

