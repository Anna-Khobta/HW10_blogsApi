import {NextFunction, Request, Response} from "express";
import {jwtService} from "../application/jwt-service";
import {TokenDBType} from "../repositories/db/types";

export const refreshTokenMiddleware = async (req:Request, res:Response, next: NextFunction) => {

    const refreshToken = req.cookies['refreshToken']

    if (!refreshToken) {
        return res.status(401).send('Access Denied. No refresh token provided.')
    }

    const isRefreshTokenValid = await jwtService.checkRefreshTokenIsValid(refreshToken)

    if (!isRefreshTokenValid) {
        return res.status(401).send('Access Denied. Refresh token is not valid')
    }

    // в нашей бд только валидные токены хранятся
    // ищем в бд (не использовался ли ранее) и заменяем даты и ip

    const refreshTokenFromDb: TokenDBType | null = await jwtService.getRefreshTokenFromDb(refreshToken) //

    if (!refreshTokenFromDb) {
        return res.status(401).send('Invalid refresh token')
    }

    req.cookies['refreshToken'] = refreshTokenFromDb
    next()
}


export const checkRefreshToken= async (req:Request, res:Response, next: NextFunction) => {

    const refreshToken = req.cookies['refreshToken']

    console.log(refreshToken)

    if (refreshToken) {
        const isRefreshTokenValid = await jwtService.checkRefreshTokenIsValid(refreshToken)
        if (isRefreshTokenValid) {
            const refreshTokenFromDbWithUserId: TokenDBType | null = await jwtService.getRefreshTokenFromDb(refreshToken)
            if (refreshTokenFromDbWithUserId) {
                req.cookies['refreshToken'] = refreshTokenFromDbWithUserId
                next()
            } next()
        } next()
    } next()

}