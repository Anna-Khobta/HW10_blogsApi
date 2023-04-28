import {PostModelClass} from "./db/db";
import {LikeStatusesEnum, PostsWithPagination, PostViewType} from "./db/types";
import {SortOrder} from "mongoose";
import {last3UsersLikes} from "../functions/found3LastLikedUsers";
import {injectable} from "inversify";


@injectable()
export class PostsQueryRepository {
    async findPosts(blogId: string|null,page: number,
                    limit: number, sortDirection: SortOrder,
                    sortBy: string, skip: number): Promise<PostsWithPagination> {

        let filter: any = {}

        if (blogId) {
            filter = {blogId: blogId}
        }

        let foundPosts = await PostModelClass.find(
            (filter),
            {__v: 0})
            .skip(skip)
            .limit(limit)
            .sort({[sortBy]: sortDirection})
            .lean()

        const mappedPosts = await Promise.all(foundPosts.map(async post => {

            //const likers = await PostModelClass.findLast3LikedUsers(post._id.toString())


            const likers = await last3UsersLikes(post._id.toString())


            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.likesCount,
                    dislikesCount: post.dislikesCount,
                    myStatus: LikeStatusesEnum.None,
                    newestLikes: likers
                }
            }
        }))

        const total = await PostModelClass.countDocuments()
        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: mappedPosts
        }

    }

    async findPostsWithUser(blogId: string|null, page: number,
                            limit: number, sortDirection: SortOrder,
                            sortBy: string, skip: number, userId: string): Promise<PostsWithPagination> {

        let filter: any = {}

        if (blogId) {
            filter = {blogId: blogId}
        }

        let foundPosts = await PostModelClass.find(
            (filter),
            {__v: 0})
            .skip(skip)
            .limit(limit)
            .sort({[sortBy]: sortDirection})
            .lean()

        const mappedPosts = await Promise.all(foundPosts.map(async post => {

            const likers = await last3UsersLikes(post._id.toString())

            const myStatus = post.usersEngagement.find(el => el.userId === userId)

            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.likesCount,
                    dislikesCount: post.dislikesCount,
                    myStatus: myStatus?.userStatus || LikeStatusesEnum.None,
                    newestLikes: likers
                }
            }
        }))

        const total = await PostModelClass.countDocuments(filter)
        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: mappedPosts
        }

    }

    async findPostById(createdId: string): Promise<PostViewType | null> {

        try {
            const post = await PostModelClass.findById(createdId).lean()

            if (!post) {
                return null
            }

            const likers = await last3UsersLikes(post._id.toString())

            const postView = {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.likesCount,
                    dislikesCount: post.dislikesCount,
                    myStatus: LikeStatusesEnum.None,
                    newestLikes: likers
                }
            }

            return postView
        } catch (error) {
            return null
        }
    }

    async findPostByIdWithUser(postId: string, userId: string): Promise<any | null> {

        const postInstance = await PostModelClass.findById({_id: postId}, {__v: 0})

        if (!postInstance) {
            return null
        }

        let myStatus

        const userLikeInfo = postInstance.usersEngagement.find(
            (user) => user.userId === userId);

        if (!userLikeInfo) {
            myStatus = LikeStatusesEnum.None;
        } else {
            myStatus = userLikeInfo.userStatus
        }

        const likers = await last3UsersLikes(postInstance._id.toString())

        const postView = {
            id: postId,
            title: postInstance.title,
            shortDescription: postInstance.shortDescription,
            content: postInstance.content,
            blogId: postInstance.blogId,
            blogName: postInstance.blogName,
            createdAt: postInstance.createdAt,
            extendedLikesInfo: {
                likesCount: postInstance.likesCount,
                dislikesCount: postInstance.dislikesCount,
                myStatus: myStatus,
                newestLikes: likers
            }
        }

        return postView

    }
    async findPostByIdWithoutUser(postId: string): Promise<any | null> {

        const postInstance = await PostModelClass.findById({_id: postId}, {__v: 0})

        if (!postId) {
            return null
        }

        if (!postInstance) {
            return null
        }

        const likers = await last3UsersLikes(postId)

        const postView = {
            id: postId,
            title: postInstance.title,
            shortDescription: postInstance.shortDescription,
            content: postInstance.content,
            blogId: postInstance.blogId,
            blogName: postInstance.blogName,
            createdAt: postInstance.createdAt,
            extendedLikesInfo: {
                likesCount: postInstance.likesCount,
                dislikesCount: postInstance.dislikesCount,
                myStatus: LikeStatusesEnum.None,
                newestLikes: likers
            }
        }

        return postView

    }

    async checkUserLike(postId: string, userId: string):
        Promise<LikeStatusesEnum | null> {

        try {

            const postInstance = await PostModelClass.findOne({_id: postId})

            //console.log(postInstance)

            if (!postInstance
            ) {
                return null
            }

            const userLikeInfo = postInstance.usersEngagement.find(
                (user) => user.userId === userId
            );

//console.log(userLikeInfo, 'userLikeInfo')

            if (!userLikeInfo) {
                return null;
            }
            return userLikeInfo.userStatus
        } catch
            (error) {
            console.log(error);
            return null;
        }
    }
}
