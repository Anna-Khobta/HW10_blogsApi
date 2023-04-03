import {
    checkCodeInDb,
    checkUserEmailInbase,
    emailValidation, emailValidationSimple,
    loginOrEmailValidation,
    loginValidation,
    passwordValidation
} from "../middlewares/authentication";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {Request, Response, Router} from "express";
import {usersRepository} from "../repositories/users-db-repositories";
import {usersService} from "../domain/users-service";
import {jwtService} from "../application/jwt-service";
import {authBearerMiddleware} from "../middlewares/authToken";
import {authService} from "../domain/auth-service";
import {tokenService} from "../domain/token-service";
import {limitIpMiddleware} from "../middlewares/limit-req-ip";
import {refreshTokenMiddleware} from "../middlewares/RefreshToken-Middleware";


export const authRouter = Router({})

authRouter
    .post("/login",
    loginOrEmailValidation,
    passwordValidation,
    inputValidationMiddleware,
        limitIpMiddleware,
    async (req:Request, res: Response) => {

        const ip = req.ip // req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const deviceTitle = req.headers['user-agent'] || "defaultDevice"

        let foundUserInDb = await usersRepository.checkUserLoginOrEmail(req.body.loginOrEmail)

        if (!foundUserInDb) {
            res.sendStatus(401)
            return
        }

        let isPasswordCorrect = await usersService.checkPasswordCorrect(foundUserInDb.accountData.password, req.body.password)

        if (!isPasswordCorrect) {
            return res.sendStatus(401) //можно писать и так и как выше
        }

        const jwtResult = await jwtService.createJwtToken(foundUserInDb.id) // получаем токены и decodedRefreshToken

        try {
            const isTokenAddedToDb = await tokenService.createTokenDB (jwtResult.decodedRefreshToken, ip, deviceTitle) //add in db
        } catch (error) {
            return res.status(400).json({ message: "Something went wrong with Db"})
        }

                res
                    .status(200)
                    .cookie('refreshToken', jwtResult.refreshToken, { httpOnly: true, secure: true }) // sameSite: "none"}) // secure: true }) //
                    .json({"accessToken": jwtResult.accessToken})


    })

    .get("/me",
    authBearerMiddleware,
    async (req:Request, res: Response) => {

    const meUser = await usersRepository.findUserById(req.user!.id)

        //console.log(meUser)

        res.status(200).send({
            userId: meUser?.id,
            login: meUser?.accountData.login,
            email: meUser?.accountData.email
        })

})


// Registration in the system. Email with confirmation code will be send to passed email address

    .post("/registration",
        limitIpMiddleware,
    loginValidation,
    passwordValidation,
    emailValidation,
    inputValidationMiddleware,

    async (req:Request, res: Response) => {

            const newUser = await authService.createUser(req.body.login, req.body.email, req.body.password)
            res.sendStatus(204)
        if (!newUser) {
            res.status(400).json({ message: "Something went wrong with creating"})
        }

    })

    .post("/registration-confirmation",
        limitIpMiddleware,
        checkCodeInDb,
        inputValidationMiddleware,
        async (req:Request, res: Response) => {
        const result = await authService.confirmEmail(req.body.code)
            if (result) {
                res.sendStatus(204)
            } else {
                res.status(400).json({ errorsMessages: [{ message: "Incorrect code or it was already used", field: "code" }] })
            }
        })


    .post("/registration-email-resending",
        limitIpMiddleware,
    emailValidationSimple,
    checkUserEmailInbase,
    inputValidationMiddleware,
    async (req:Request, res: Response) => {

        const result = await authService.checkEmail(req.body.email)
        if (result) {
            res.sendStatus(204)
        } else {
            res.status(400).json({ errorsMessages: [{ message: "Your email was already confirmed", field: "email" }] })
        }
})

    .post("/refresh-token",
        refreshTokenMiddleware,
        async (req:Request, res: Response) => {

        const ip = req.ip // req.headers['x-forwarded-for'] || req.socket.remoteAddress

        const refreshToken = req.cookies['refreshToken']

        const createNewTokens = await jwtService.createNewRefreshToken(refreshToken.userId, refreshToken.deviceId)

        const isTokenUpdatedInDb = await tokenService.updateTokenDB (createNewTokens.decodedRefreshToken, ip) //add in db

        if (!isTokenUpdatedInDb) {
            return res.status(400).json({message: "Something went wrong with Db"})
        }

        res
            .status(200)
            .cookie('refreshToken', createNewTokens.refreshToken, { httpOnly: true,  secure: true }) // sameSite: "none"}) // secure: true })
            .json({"accessToken": createNewTokens.accessToken})
})

    .post("/logout",
        refreshTokenMiddleware,
        async (req:Request, res: Response) => {

        const refreshToken = req.cookies['refreshToken'];

        const isTokenDeleted = await tokenService.deleteToken(refreshToken)

        if (!isTokenDeleted) {
            return res.status(401).send('Something wrong with Db')
        }

        return res.sendStatus(204)

        })

