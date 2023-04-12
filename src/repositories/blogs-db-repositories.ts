import {BlogModelClass} from "./db";
import {BlogType} from "../type/types";


export const blogsRepository = {

    async createBlog(newBlog: BlogType): Promise<BlogType | null> {

        await BlogModelClass.create(newBlog)
        return BlogModelClass.findOne({id: newBlog.id}, {_id: 0, __v: 0}).lean() ;
    },

    async updateBlog(id: string, name: string, description: string, websiteUrl: string ): Promise<boolean> {

        const result = await BlogModelClass.updateOne({id: id}, {$set: {name: name, description:description, websiteUrl:websiteUrl  }})
        return result.matchedCount === 1

    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await BlogModelClass.findOneAndDelete({id: id})
        return result !== null;
        //  If the deleted document exists, we return true, otherwise, we return false.
    },


    async deleteAllBlogs(): Promise<number> {
        const result = await BlogModelClass.deleteMany({})
        return result.deletedCount
    }
}



