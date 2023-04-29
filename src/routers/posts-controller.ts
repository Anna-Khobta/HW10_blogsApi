import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {PostsService} from "../domain/posts-service";
import {Request, Response} from "express";
import {getPagination} from "../functions/pagination";
import {commentsService} from "../domain/comments-service";
import {commentsQueryRepositories} from "../repositories/comments-query-repositories";
import {inject, injectable} from "inversify";

@injectable()
export class PostsController {

    private postsQueryRepositories: PostsQueryRepository

    constructor(@inject(PostsService) protected postsService: PostsService) {
        this.postsQueryRepositories = new PostsQueryRepository()
    }

    async createPost(req: Request, res: Response) {

        const createdPostId = await this.postsService.createPost(req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)

        if (!createdPostId) {
            return res.status(404)
        }
        const postView = await this.postsQueryRepositories.findPostById(createdPostId)
        res.status(201).send(postView)
    }

    async getPost(req: Request, res: Response) {
        const userInfo = req.user

        const {page, limit, sortDirection, sortBy, skip} = getPagination(req.query)

        if (!userInfo) {
            const foundPostsWithoutUser = await this.postsQueryRepositories.findPosts(null, page, limit, sortDirection, sortBy, skip)
            res.status(200).send(foundPostsWithoutUser)

        } else {
            const foundPostsWithUser = await this.postsQueryRepositories.findPostsWithUser(null, page, limit, sortDirection, sortBy, skip, userInfo.id)
            res.status(200).send(foundPostsWithUser)
        }
    }

    async getPostById(req: Request, res: Response) {

        let userInfo = req.user

        if (!userInfo) {
            const findPostWithoutUserInfo = await this.postsQueryRepositories.findPostByIdWithoutUser(req.params.id)

            if (!findPostWithoutUserInfo) {
                return res.status(404)
            }
            return res.status(200).send(findPostWithoutUserInfo)
        }

        let findPostWithAuth = await this.postsQueryRepositories.findPostByIdWithUser(req.params.id, userInfo.id)

        if (!findPostWithAuth) {
            return res.status(404)
        } else {
            return res.status(200).send(findPostWithAuth)
        }
    }

    async updatePost(req: Request, res: Response) {

        const updatedPostId = await this.postsService.updatePost(req.params.id, req.body.title,
            req.body.shortDescription, req.body.content, req.body.blogId)

        if (!updatedPostId) {
            return res.sendStatus(404)
        } else {
            return res.sendStatus(204)
        }
    }

    async deletePostById(req: Request, res: Response) {

        const isDeleted = await this.postsService.deletePost(req.params.id)

        if (isDeleted) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }

    async createCommentForPost(req: Request, res: Response) {

        const post = await this.postsQueryRepositories.findPostById(req.params.postId)

        const userInfo = req.user

        if (!post) {
            return res.sendStatus(404)
        }

        const newComment = await commentsService.createComment(post.id, req.body.content, userInfo!)
        res.status(201).send(newComment)

    }

    async getCommentsForPost(req: Request, res: Response) {
        const userInfo = req.user

        const {page, limit, sortDirection, sortBy, skip} = getPagination(req.query)

        let post = await this.postsQueryRepositories.findPostById(req.params.postId)

        if (!post) {
            return res.sendStatus(404)
        }

        if (!userInfo) {
            const foundComments = await commentsQueryRepositories.findCommentsForPost(post.id, page, limit, sortDirection, sortBy, skip)
            res.status(200).send(foundComments)
        } else {
            const foundCommentsWithUserId = await commentsQueryRepositories.findCommentsForPostWithUser(post.id, page, limit, sortDirection, sortBy, skip, userInfo.id)
            res.status(200).send(foundCommentsWithUserId)
        }
    }

    async updateCommentForPost(req: Request, res: Response) {

        const userInfo = req.user // id юзера, который залогинен и хочет лайкнуть
        const likeStatus = req.body.likeStatus

        const findPostById = await this.postsQueryRepositories.findPostById(req.params.postId)

        if (!findPostById) {
            return res.sendStatus(404)
        }

        const updateLikeStatus = await this.postsService.createLikeStatus(userInfo, findPostById, req.params.postId, likeStatus)

        if (!updateLikeStatus) {
            return res.sendStatus(400)
        } else return res.sendStatus(204)

    }
}