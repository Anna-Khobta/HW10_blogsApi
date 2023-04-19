import {Request, Response, Router} from "express";

import {blogsService} from "../domain/blogs-service";
import {postsService} from "../domain/posts-service";
import {usersService} from "../domain/users-service";
import {commentsService} from "../domain/comments-service";
import {tokenService} from "../domain/token-service";
import {ipDbRepositories} from "../repositories/ip-db-repositories";

export const deleteAllRouter = Router({})

deleteAllRouter.delete('/testing/all-data',

    async (req: Request, res: Response ) => {

        try {
            await blogsService.deleteAllBlogs()

            await postsService.deleteAllPosts()

            await usersService.deleteAllUsers()

            await commentsService.deleteAllComments()

            await tokenService.deleteAllTokens()

            await ipDbRepositories.deleteALLIps()

            res.sendStatus(204)
        } catch (error) {
            console.log(error)
            return res.sendStatus(404)
        }
    })