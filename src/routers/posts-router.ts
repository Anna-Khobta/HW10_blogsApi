
import {Request, Response, Router} from "express";
import {authorizationMiddleware} from "../middlewares/authorization";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";

import {titleValidation, shortDescriptionValidation, contentValidation, idValidation} from "../middlewares/posts-validations";

import {postsService} from "../domain/posts-service";
import {getPagination} from "../functions/pagination";
import {postsQueryRepositories} from "../repositories/posts-query-repositories";
import {authBearerMiddleware} from "../middlewares/authToken";
import {contentCommentValidation} from "../middlewares/comments-validation";
import {commentsService} from "../domain/comments-service";
import {commentsQueryRepositories} from "../repositories/comments-query-repositories";



export const postsRouter = Router({})


postsRouter

    .post('/',
        authorizationMiddleware,
        idValidation,
        titleValidation,
        shortDescriptionValidation,
        contentValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response ) => {


            const createdId = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId )

            if (!createdId) { return res.sendStatus(404) }

            const postView = await postsQueryRepositories.findPostById(createdId)

            res.status(201).send(postView)

        })

    .get('/',
    async (req: Request, res: Response ) => {

       const {page, limit, sortDirection, sortBy, skip} = getPagination(req.query)

        let foundPosts = await postsQueryRepositories.findPosts(page, limit, sortDirection, sortBy, skip)

        res.status(200).send(foundPosts)
    })


    .get('/:id', async (req: Request, res: Response ) => {

    let findPostID = await postsQueryRepositories.findPostById(req.params.id)

    if (!findPostID) {
        return res.status(404)
    } else {
        return res.status(200).send(findPostID)
    }

})

    .put('/:id',
    authorizationMiddleware,
    idValidation,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    inputValidationMiddleware,
    async (req: Request, res:Response) => {

    const updatedPostId = await postsService.updatePost(req.params.id, req.body.title,
        req.body.shortDescription, req.body.content, req.body.blogId )

        console.log(updatedPostId)

        if (!updatedPostId) {
            return res.sendStatus(404)
        } else {
            return res.sendStatus(204)
        }
    })

    .delete('/:id',
    authorizationMiddleware,
    async (req: Request, res: Response ) => {

        const isDeleted = await postsService.deletePost(req.params.id)

        if (isDeleted) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })

// POSTS - COMMENTS

postsRouter
    .post('/:postId/comments',
        authBearerMiddleware,
        contentCommentValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response ) => {

            const post = await postsQueryRepositories.findPostById(req.params.postId)

            const userInfo = req.user

            if (!post) { return res.sendStatus(404) }

            const newComment = await commentsService.createComment(post.id, req.body.content, userInfo!)

            res.status(201).send(newComment)

        })

    .get('/:postId/comments',
    async (req: Request, res: Response ) => {

        const {page, limit, sortDirection, sortBy, skip} = getPagination(req.query)

        let post = await postsQueryRepositories.findPostById(req.params.postId)

        if (!post) { return res.sendStatus(404) }

        const foundComments = await commentsQueryRepositories.findCommentsForPost(post.id, page, limit, sortDirection, sortBy, skip)
        res.status(200).send(foundComments)

    })


