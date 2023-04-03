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

blogsRouter.get('/blogs', async (req: Request, res: Response ) => {

    const {page, limit, sortDirection, sortBy, searchNameTerm, skip} = getPagination(req.query)

    const foundBlogs = await blogsQueryRepository.findBlogs(page, limit, sortDirection, sortBy, searchNameTerm, skip)
    res.status(200).send(foundBlogs)
})


// Returns blog by Id
blogsRouter.get('/blogs/:id', async(req: Request, res: Response ) => {

    let blogByID = await blogsQueryRepository.findBlogById(req.params.id)

    if (blogByID) {
        return res.status(200).send(blogByID)
    } else {
        return res.send(404)
    }

})



blogsRouter.post('/blogs',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response ) => {

        const newBlog = await blogsService.createBlog(req.body.name, req.body.description, req.body.websiteUrl )
        res.status(201).send(newBlog)
    }
)


blogsRouter.put('/blogs/:id',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    async (req: Request, res:Response) => {

        const isUpdated = await blogsService.updateBlog(((+req.params.id).toString()), req.body.name, req.body.description, req.body.websiteUrl )
        if (isUpdated) {
            // const blog = await blogsRepository.findBlogById(req.params.id)
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    })

blogsRouter.delete('/blogs/:id',
    authorizationMiddleware,
   async (req: Request, res: Response ) => {

    const isDeleted = await blogsService.deleteBlog(req.params.id)

    if (isDeleted) {
        res.send(204)
    } else {
        res.send(404)
    }
   })


// Returns all posts for specified blog
blogsRouter.get("/blogs/:blogId/posts", async (req: Request, res: Response) => {

    let checkBlogByID = await blogsQueryRepository.findBlogByblogId(req.params.blogId)

    const {page, limit, sortDirection, sortBy, skip} = getPagination(req.query)
    const blogId = req.params.blogId

    if (checkBlogByID) {
        let postsForBlog = await postsQueryRepositories.findPostsByBlogId(blogId, page, limit, sortDirection, sortBy, skip)
        return res.status(200).send(postsForBlog)
    } else {
        return res.send(404)
    }

})

//create new post for special blog
blogsRouter.post('/blogs/:blogId/posts',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response ) => {

        const newPostWithoughtID = await postsService.createPost(req.body.title,
            req.body.shortDescription, req.body.content, req.params.blogId )

        if (newPostWithoughtID) {
            res.status(201).send(newPostWithoughtID)
        } else {
            return res.send(404)
        }
    })

