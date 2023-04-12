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
import {usersQueryRepositories} from "../repositories/users-query-repositories";

export const usersRouter = Router({})



// get users with filter and pagination
usersRouter

    .post('/',
    authorizationMiddleware,
    loginValidation,
    emailValidation,
    passwordValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {

        let isUserRegisteredInDb = await usersQueryRepositories.findUserByLoginOrEmail(req.body.login, req.body.email)

        if (isUserRegisteredInDb) { return res.sendStatus(400) }

        const createdUserId = await usersService.createUser(req.body.login, req.body.email, req.body.password)

        if (!createdUserId) {  return res.sendStatus(400) }

       const userView = await usersQueryRepositories.findUserById(createdUserId)

            res.status(201).send(userView)

        })

    .get('/',
    authorizationMiddleware,
    async (req: Request, res: Response) => {

    const {page, limit, sortDirection, sortBy, searchLoginTerm, searchEmailTerm, skip} = getPagination(req.query)

        const foundUsers = await usersQueryRepositories.findUsers(page, limit, sortDirection, sortBy, searchLoginTerm, searchEmailTerm, skip)

        res.status(200).send(foundUsers)
})

    .delete('/:id',
    authorizationMiddleware,
    async (req: Request, res: Response) => {

    const isDeleted = await usersService.deleteUser(req.params.id)

        if (!isDeleted) { return res.send(404) }
        return res.send(204)
    })