import {SortDirection} from "mongodb";
import {postsCollection} from "./db";
import {PostType} from "./types";


export const postsQueryRepositories = {
    async findPosts(page: number, limit:number, sortDirection: SortDirection, sortBy: string, skip: number) {
        let findPosts = await postsCollection.find(
            {},
            {projection: {_id: 0}})
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortDirection })
            .toArray()

        const total = await postsCollection.countDocuments()
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
        let post: PostType | null = await postsCollection.findOne({id: id}, {projection: {_id: 0}})
        if (post) {
            return post
        } else {
            return null
        }
    },

    async findPostsByBlogId (blogId:string, page: number, limit:number, sortDirection: SortDirection, sortBy: string, skip: number) {
        let findPosts = await postsCollection.find(
            {blogId: blogId},
            {projection: {_id: 0}})
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortDirection })
            .toArray()

        const total = await postsCollection.countDocuments({blogId: blogId})
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
