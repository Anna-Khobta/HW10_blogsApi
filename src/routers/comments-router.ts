import {authBearerMiddleware} from "../middlewares/authToken";
import {Request, Response, Router} from "express";
import {commentsService} from "../domain/comments-service";
import {contentCommentValidation} from "../middlewares/comments-validation";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {commentsQueryRepositories} from "../repositories/comments-query-repositories";


export const commentsRouter = Router()

commentsRouter

    //update comment by id
    .put("/:id",
        authBearerMiddleware,
        contentCommentValidation,
        inputValidationMiddleware,
        async (req: Request, res:Response) => {


            const userInfo = req.user

            const checkUserOwnComment = await commentsService.checkUser(userInfo!, req.params.id)

            const updatedCommentWithoughtId = await commentsService.updateComment(req.params.id, req.body.content)

            if (updatedCommentWithoughtId) {

                if (checkUserOwnComment) {

                    res.sendStatus(204)

            } else {
                res.sendStatus(403)
            }

            } else {
                return res.sendStatus(404)
            }

        })

    //return comment by id
    .get("/:id/", async (req: Request, res:Response) => {

        const findCommentById = await commentsQueryRepositories.findCommentById(req.params.id)

        if (findCommentById) {
            return res.status(200).send(findCommentById)
        } else {
            return res.send(404)
        }
        })

    //delete comment by id
    .delete("/:id",
        authBearerMiddleware,
        async (req: Request, res:Response) => {

        const userInfo = req.user

        const findCommentById = await commentsQueryRepositories.findCommentById(req.params.id)

            if (findCommentById) {

                const checkUserOwnComment = await commentsService.checkUser(userInfo!, req.params.id)


                if (checkUserOwnComment) {

                    const isDeleted = await commentsService.deleteComment(req.params.id)

                   return res.sendStatus(204)

                } else {
                    return res.sendStatus(403)
                }
            } else {
                return res.send(404)
            }

        })