import {CommentsModelClass, PostModelClass} from "./db/db";
import {LikeStatusesEnum, PostsWithPagination, PostViewType} from "./db/types";
import {SortOrder} from "mongoose";


export const postsQueryRepositories = {

    async findPosts(page: number, limit: number, sortDirection: SortOrder, sortBy: string, skip: number): Promise<PostsWithPagination> {

        let findPosts: PostViewType[] = await PostModelClass.find(
            {},
            {_id: 0, __v: 0})
            .skip(skip)
            .limit(limit)
            .sort({sortBy: sortDirection})
            .lean()

        console.log(findPosts)

        const total = await PostModelClass.countDocuments()
        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findPosts
        }

    },

    async findPostById(createdId: string): Promise<PostViewType | null> {

        try {
            const post = await PostModelClass.findById(createdId).lean()

            if (!post) {
                return null
            }

            const postView = {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount,
                myStatus: LikeStatusesEnum.None
            }

            return postView
        } catch (error){
            return null
        }
    },

    async findPostsByBlogId(blogId: string, page: number, limit: number, sortDirection: SortOrder, sortBy: string, skip: number): Promise<PostsWithPagination> {
        let findPosts: PostViewType[] = await PostModelClass.find(
            {blogId: blogId},
            {projection: {_id: 0}})
            .skip(skip)
            .limit(limit)
            .sort({sortBy: sortDirection})
            .lean()

        const total = await PostModelClass.countDocuments({blogId: blogId})
        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findPosts
        }
    },

    async checkUserLike (postId: string, userId: string): Promise<LikeStatusesEnum | null> {

        try {

            const commentInstance = await CommentsModelClass.findById({_id: postId})

            const userLikeInfo = commentInstance!.usersEngagement.find(
                (user) => user.userId === userId
            );

            if (!userLikeInfo) {
                return null;
            }
            return userLikeInfo.userStatus
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}