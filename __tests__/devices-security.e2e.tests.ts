import {app} from "../src/settings";
import request from "supertest"
import {
    authRefreshToken, authRegistarion,
    createUser,
    deleteAllCreateUser, deleteByDeviceId, fiveRequests, getAllUserDevices,
    getUsersWithPagination, loginInSystem, waitSomeSeconds
} from "../src/functions/tests-functions";
import jwt from "jsonwebtoken";
import {
    basicAuth, fourBrowsers,
    myEmail,
    myLogin,
    myPassword, secondEmail, secondLogin,
    userLoginPassEmail
} from "../src/functions/tests-objects";
import {client} from "../src/repositories/db";



describe('devices tests', () => {

    beforeAll(async () => {
        await request(app).delete('/testing/all-data')
    })

    afterAll(async () => {
        await client.close();
    })

    it('/users: should create new user; status 201; also GET /users with pagination',
        async () => {

        const newUser = await createUser(myLogin, myPassword, myEmail, basicAuth)
        expect(newUser.status).toBe(201)

        const createdUser = newUser.body

        const expectedUser = {
            id: expect.any(String),
            login: myLogin,
            email: myEmail,
            createdAt: createdUser.createdAt
        }
        expect(createdUser).toEqual(expectedUser)

        const users = []
        users.push(createdUser)

        const getUsers = await getUsersWithPagination(null, "sortDirection=asc", "pageNumber=1", "pageSize=5", "searchLoginTerm=n", "searchEmailTerm=n")

        expect(getUsers.status).toBe(200)

        expect(getUsers.body).toStrictEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 5,
            "totalCount": users.length,
            "items": users
        })
    })

        it('GET /security/devices: login user 1 time, then get device list; status 200' +
            'used additional methods: POST auth/login', async () => {

            const login = await loginInSystem(myEmail, myPassword)
                expect(login.status).toBe(200)

            const myCookies = login.headers['set-cookie'][0]

            expect(login.body).toMatchObject({
                "accessToken": expect.any(String)
            });

            expect(myCookies).toBeDefined()

            const getAllDevices = await getAllUserDevices(myCookies)
            expect(getAllDevices.status).toBe(200)

            const expectedDevices = [{
                        ip: expect.any(String),
                        title: expect.any(String),
                        lastActiveDate: expect.any(String),
                        deviceId: expect.any(String)
                    }]

            expect(getAllDevices.body).toEqual(expectedDevices)

        })


        it ("DELETE /security/devices/:deviceId: " +
            "error 404, error 401 ", async () => {

            const login = await loginInSystem(myEmail, myPassword)
            expect(login.status).toBe(200)

            const myCookies = login.headers['set-cookie'][0]

            const incorrectDeviceId = 123

            const deleteByDeviceId404 = await deleteByDeviceId(incorrectDeviceId, myCookies)
            expect(deleteByDeviceId404.status).toBe(404)

            const deleteByDeviceId401 = await deleteByDeviceId(incorrectDeviceId, null)
            expect(deleteByDeviceId401.status).toBe(401)

        })

    it('GET -> "/security/devices": login user 4 times from different browsers;' +
        'used additional methods: POST => /auth/login ', async () => {

        const newUser = await deleteAllCreateUser(myLogin, myPassword, myEmail, basicAuth)
            expect(newUser.status).toBe(201)

        const wait = await waitSomeSeconds(5)

        let myCookies = []

        for (let i = 0; i < fourBrowsers.length; i++) {
            const loginRes = await request(app)
                .post('/auth/login')
                .send({
                    loginOrEmail: myLogin,
                    password: myPassword
                })
                .set('User-Agent', fourBrowsers[i])
                .expect(200);

            myCookies.push(loginRes.headers['set-cookie']);
        }

        const getAllDevices = await getAllUserDevices(myCookies)
        expect(getAllDevices.status).toBe(200)

        expect(getAllDevices.body.length).toBeGreaterThan(0);
        expect(getAllDevices.body).toHaveLength(4);

        getAllDevices.body.forEach((device: any) => {
            expect(device).toEqual({
                deviceId: expect.any(String),
                ip: expect.any(String),
                lastActiveDate: expect.any(String),
                title: expect.any(String)
            });
            expect(device.lastActiveDate).toMatch(/^20\d{2}(-[01]\d){2}T([0-2]\d):[0-5]\d:[0-5]\d\.\d{3}Z$/);
        });
    })


        it('POST -> "/auth/refresh-token": should return new refresh and access tokens; status 200', async () => {

            const newUser = await deleteAllCreateUser(myLogin, myPassword, myEmail, basicAuth)

            const login = await loginInSystem(myEmail, myPassword)

            const myCookies = login.headers['set-cookie'][0]

            expect(login.body).toMatchObject({
                "accessToken": expect.any(String)
            });

            expect(myCookies).toBeDefined()

            const responseGenerateTokens = await authRefreshToken(myCookies)
            expect(responseGenerateTokens.status).toBe(200)

                const resAccessToken = responseGenerateTokens.body.accessToken
                const resRefreshToken = responseGenerateTokens.headers['set-cookie'][0].split(';')[0].split('=')[1]

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

    afterAll(async () => {
        await client.close();
    })

    it('more than 5 requests were sent within 10 seconds' +
        'status 204 after waiting', async () => {

        const send5Requests = await fiveRequests("/auth/registration/", {
            "login": myLogin,
            "password": myPassword,
            "email": myEmail
        })
        expect(send5Requests).toBe(429);

        const wait = await waitSomeSeconds(10)

        const registrationRes = await authRegistarion(secondLogin, myPassword, secondEmail)

         expect(registrationRes.status).toBe(204)
    })
})