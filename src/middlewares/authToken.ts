import {NextFunction, Request, Response} from "express";
import {usersService} from "../domain/users-service";
import {jwtService} from "../application/jwt-service";

export const authBearerMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const auth = req.headers.authorization

    if (!auth) {
        return res.sendStatus(401)
    }

    const tokenFromHead = auth.split(' ')[1]

    const userId = await jwtService.getUserIdByToken(tokenFromHead)

    if (!userId) {
        console.log('Oops, something wrong, no userId')
        return res.send(401) // add return here не ломается?
    }
    const user = await usersService.findUserById(userId.toString())
    if (!user) return res.sendStatus(401)
    req.user = user
    next()

}


export const authBearerFindUser = async (req: Request, res: Response, next: NextFunction) => {

    const auth = req.headers.authorization

    if (auth) {
        const tokenFromHead = auth.split(' ')[1]
        const userId = await jwtService.getUserIdByToken(tokenFromHead)
        if (userId) {

            const user = await usersService.findUserById(userId.toString())
            req.user = user
            next()

        } else {
            next()
        }
    } else {
        next()
    }


}
