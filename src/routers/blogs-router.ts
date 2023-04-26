import {Request, Response, Router} from "express";
import {authorizationMiddleware} from "../middlewares/authorization";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";

import {nameValidation, descriptionValidation, websiteUrlValidation} from "../middlewares/blogs-validations";

import {blogsQueryRepository} from "../repositories/blogs-query-repository";
import {blogsService} from "../domain/blogs-service";

export const blogsRouter = Router({})

import {getPagination} from "../functions/pagination";
import {postsQueryRepositories} from "../repositories/posts-query-repositories";
import {contentValidation, shortDescriptionValidation, titleValidation} from "../middlewares/posts-validations";
import {postsService} from "../domain/posts-service";
import {authBearerFindUser} from "../middlewares/authToken";


blogsRouter

    .post('/blogs',
        authorizationMiddleware,
        nameValidation,
        descriptionValidation,
        websiteUrlValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response) => {

            const newBlog = await blogsService.createBlog(req.body.name, req.body.description, req.body.websiteUrl)
            res.status(201).send(newBlog)
        }
    )


    .get('/blogs', async (req: Request, res: Response) => {

        const {page, limit, sortDirection, sortBy, searchNameTerm, skip} = getPagination(req.query)

        const foundBlogs = await blogsQueryRepository.findBlogs(page, limit, sortDirection, sortBy, searchNameTerm, skip)
        res.status(200).send(foundBlogs)
    })


    // Returns blog by Id
    .get('/blogs/:id', async (req: Request, res: Response) => {

        let blogByID = await blogsQueryRepository.findBlogById(req.params.id)

        if (blogByID) {
            return res.status(200).send(blogByID)
        } else {
            return res.send(404)
        }

    })


    .put('/blogs/:id',
        authorizationMiddleware,
        nameValidation,
        descriptionValidation,
        websiteUrlValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response) => {

            const isUpdated = await blogsService.updateBlog(((+req.params.id).toString()), req.body.name, req.body.description, req.body.websiteUrl)
            if (isUpdated) {
                // const blog = await blogsRepository.findBlogById(req.params.id)
                res.sendStatus(204)
            } else {
                res.sendStatus(404)
            }
        })

    .delete('/blogs/:id',
        authorizationMiddleware,
        async (req: Request, res: Response) => {

            const isDeleted = await blogsService.deleteBlog(req.params.id)

            if (isDeleted) {
                res.sendStatus(204)
            } else {
                res.sendStatus(404)
            }
        })

    //create new post for special blog
    .post('/blogs/:blogId/posts',
        authorizationMiddleware,
        titleValidation,
        shortDescriptionValidation,
        contentValidation,
        inputValidationMiddleware,
        async (req: Request, res: Response) => {

            const createdPostId = await postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.params.blogId)

            if (!createdPostId) {
                return res.sendStatus(404)
            }

            const postView = await postsQueryRepositories.findPostById(createdPostId)

            res.status(201).send(postView)

        })


    .get("/blogs/:blogId/posts",
        authBearerFindUser,
        async (req: Request, res: Response) => {

            const userInfo = req.user

            const {page, limit, sortDirection, sortBy, skip} = getPagination(req.query)

            const blogId = req.params.blogId

            let checkBlogByID = await blogsQueryRepository.findBlogByblogId(req.params.blogId)

            if (!checkBlogByID) {
                return res.send(404)
            }

            if (!userInfo) {

                const foundPostsWithoutUser = await postsQueryRepositories.findPosts(blogId, page, limit, sortDirection, sortBy, skip)
                res.status(200).send(foundPostsWithoutUser)

            } else {

                const foundPostsWithUser = await postsQueryRepositories.findPostsWithUser(blogId, page, limit, sortDirection, sortBy, skip, userInfo.id)
                res.status(200).send(foundPostsWithUser)

            }

        })


