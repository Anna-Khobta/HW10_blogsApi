import {Request, Response, Router} from "express";

import {authorizationMiddleware} from "../middlewares/authorization";
import {
    loginValidation,
    emailValidation,
    passwordValidation,
} from "../middlewares/authentication";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {getPagination} from "../functions/pagination";


import {usersService} from "../domain/users-service";
import {usersRepository} from "../repositories/users-db-repositories";

export const usersRouter = Router({})



// get users with filter and pagination
usersRouter.get('/',
    authorizationMiddleware,
    async (req: Request, res: Response) => {

    const {page, limit, sortDirection, sortBy, searchLoginTerm, searchEmailTerm, skip} = getPagination(req.query)

        const foundUsers = await usersRepository.findUsers(page, limit, sortDirection, sortBy, searchLoginTerm, searchEmailTerm, skip)

        res.status(200).send(foundUsers)
})


usersRouter.post('/',
    authorizationMiddleware,
    loginValidation,
    emailValidation,
    passwordValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {

    let checkUserInDb = await usersRepository.checkUser(req.body.login, req.body.email)

        if (!checkUserInDb) {
            const newUser = await usersService.createUser(req.body.login, req.body.email, req.body.password)
            res.status(201).send(newUser)

        } else {
            return res.send(400)
        }
    })

usersRouter.delete('/:id',
    authorizationMiddleware,
    async (req: Request, res: Response) => {

    const isDeleted = await usersService.deleteUser(req.params.id)

        if (isDeleted) {
            res.send(204)
        } else {
            res.send(404)
        }
    })