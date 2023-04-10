import {SortDirection} from "mongodb";
import {PostModelClass} from "./db";
import {PostsWithPagination, PostType} from "../type/types";
import {SortOrder} from "mongoose";


export const postsQueryRepositories = {

    async findPosts(page: number, limit:number, sortDirection: SortOrder, sortBy: string, skip: number): Promise<PostsWithPagination> {
        let findPosts: PostType[] = await PostModelClass.find(
            {},
            {projection: {_id: 0}})
            .skip(skip)
            .limit(limit)
            .sort({ sortBy: sortDirection })
            .lean()

        const total = await PostModelClass.countDocuments()
        const pagesCount = Math.ceil(total/ limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findPosts
        }

    },

    async findPostById(id: string): Promise<PostType | null> {
        let post: PostType | null = await PostModelClass.findOne({id: id}, {projection: {_id: 0}}).lean()
        if (post) {
            return post
        } else {
            return null
        }
    },

    async findPostsByBlogId (blogId:string, page: number, limit:number, sortDirection: SortOrder, sortBy: string, skip: number): Promise <PostsWithPagination> {
        let findPosts: PostType[] = await PostModelClass.find(
            {blogId: blogId},
            {projection: {_id: 0}})
            .skip(skip)
            .limit(limit)
            .sort({ sortBy: sortDirection })
            .lean()

        const total = await PostModelClass.countDocuments({blogId: blogId})
        const pagesCount = Math.ceil(total/ limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findPosts
        }

    }
}
