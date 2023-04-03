import {Request, Response, Router} from "express";

import {blogsService} from "../domain/blogs-service";
import {postsService} from "../domain/posts-service";
import {usersService} from "../domain/users-service";
import {commentsService} from "../domain/comments-service";
import {tokenService} from "../domain/token-service";

export const deleteAllRouter = Router({})

deleteAllRouter.delete('/testing/all-data',

    async (req: Request, res: Response ) => {

        const deleteAllBlogs = await blogsService.deleteAllBlogs()

        const deleteAllPosts = await postsService.deleteAllPosts()

        const deleteAllUsers = await usersService.deleteAllUsers()

        const deleteAllComments = await commentsService.deleteAllComments()

        const deleteAllTokens = await tokenService.deleteAllTokens()

        if (deleteAllBlogs) {
            if (deleteAllPosts) {
                if (deleteAllUsers) {
                    if (deleteAllComments) {
                        if (deleteAllTokens){
                            res.sendStatus(204)
                        }
                    }
                }
            }
        } else {
            res.sendStatus(404)
        }
    })


