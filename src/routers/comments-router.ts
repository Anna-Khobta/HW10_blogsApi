import {authBearerFindUser, authBearerMiddleware} from "../middlewares/authToken";
import {Request, Response, Router} from "express";
import {commentsService} from "../domain/comments-service";
import {contentCommentValidation, likeStatusValidation} from "../middlewares/comments-validation";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {commentsQueryRepositories} from "../repositories/comments-query-repositories";


export const commentsRouter = Router()

commentsRouter

    //update comment by id
    .put("/:id",
        authBearerMiddleware,
        contentCommentValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response) => {

            const userInfo = req.user

            const checkUserOwnComment = await commentsService.checkUser(userInfo!, req.params.id)

            if (!checkUserOwnComment)  { return res.sendStatus(403) }

            const updatedCommentWithoutId = await commentsService.updateComment(req.params.id, req.body.content)

            if (!updatedCommentWithoutId) { return res.sendStatus (404)}

            return res.sendStatus(204)


        })

    //return comment by id
    .get("/:id",
        authBearerFindUser,
        async (req: Request, res: Response) => {

            const userInfo = req.user
            const findCommentById = await commentsQueryRepositories.findCommentById(req.params.id)

            if (!findCommentById) { return res.sendStatus(404) }

            if (!userInfo) {
                return res.status(200).send(findCommentById)
            } else {

                const checkUserStatus = await commentsQueryRepositories.checkUserLike(req.params.id, userInfo.id)

                if (!checkUserStatus) { return res.sendStatus(404) }

                return res.status(200).send(
                    {
                        "id": req.params.id,
                        "content": findCommentById.content,
                        "commentatorInfo": {
                            "userId": findCommentById.commentatorInfo.userId,
                            "userLogin": findCommentById.commentatorInfo.userLogin,
                        },
                        "createdAt": findCommentById.createdAt,
                        "likesInfo": {
                            "likesCount": findCommentById.likesInfo.likesCount,
                            "dislikesCount": findCommentById.likesInfo.dislikesCount,
                            "myStatus": checkUserStatus.toString()
                        }
                    })
            }

            })


    //delete comment by id
    .delete("/:id",
        authBearerMiddleware,
        async (req: Request, res: Response) => {

            const userInfo = req.user

            const findCommentById = await commentsQueryRepositories.findCommentById(req.params.id)

            if (findCommentById) {

                const checkUserOwnComment = await commentsService.checkUser(userInfo!, req.params.id)

                if (checkUserOwnComment) {

                    await commentsService.deleteComment(req.params.id)

                    return res.sendStatus(204)

                } else {
                    return res.sendStatus(403)
                }
            } else {
                return res.send(404)
            }
        })



//Make like/unlike/dislike/undislike operation
    .put('/:commentId/like-status',
        likeStatusValidation,
        authBearerMiddleware,
        inputValidationMiddleware,
        async (req: Request, res: Response) => {

            const userInfo = req.user // id юзера, который залогинен и хочет лайкнуть
            const likeStatus = req.body.likeStatus


            const findCommentById = await commentsQueryRepositories.findCommentById(req.params.commentId)


            if (!findCommentById) {
                return res.sendStatus(404)
            }

            const updateLikeStatus = await commentsService.createLikeStatus(userInfo, findCommentById, req.params.commentId, likeStatus)

            if (!updateLikeStatus) {
                return res.sendStatus(400)
            } else return res.sendStatus(204)

        })

