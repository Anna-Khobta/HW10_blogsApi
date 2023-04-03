import {blogsCollection} from "./db";
import {SortDirection} from "mongodb";
import {BlogType} from "./types";




export const blogsQueryRepository = {
    async findBlogs(page:number, limit:number, sortDirection: SortDirection, sortBy: string, searchNameTerm:string, skip:number) {
    let findBlogs = await blogsCollection.find(
        { name: { $regex: searchNameTerm, $options: 'i' }},
        {projection: {_id: 0}})
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortDirection })
        .toArray()

     const total = await blogsCollection.countDocuments({ name: { $regex: searchNameTerm, $options: 'i' }})
     const pagesCount = Math.ceil(total/ limit)
    return {
        pagesCount: pagesCount,
        page: page,
        pageSize: limit,
        totalCount: total,
        items: findBlogs
    }
    },


    async findBlogById(id: string): Promise<BlogType | null> {
        let blog: BlogType | null = await blogsCollection.findOne({id: id}, {projection: {_id: 0}})
        if (blog) {
            return blog
        } else {
            return null
        }
    },


    async findBlogByblogId (blogId: string): Promise<BlogType | null> {

        const result = await blogsCollection.findOne({id:blogId}, {projection: {_id: 0}})

        if (result) {
            return result
        } else {
            return null
        }

        }

/*    async findBlogByName(searchNameTerm: string): Promise<BlogType | null> {

        let blog: BlogType | null = await blogsCollection.findOne({"title": {$regex : "searchNameTerm"}}, {projection: {_id: 0}})

        if (blog) {
            return blog
        } else {
            return null
        }
    },*/

}
