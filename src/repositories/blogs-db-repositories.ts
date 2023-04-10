import {BlogModel} from "./db";
import {BlogType} from "../type/types";


export const blogsRepository = {

    async createBlog(newBlog: BlogType): Promise<BlogType | null> {

        await BlogModel.create(newBlog)
        return BlogModel.findOne({id: newBlog.id}, {projection: {_id: 0}});
    },

    async updateBlog(id: string, name: string, description: string, websiteUrl: string ): Promise<boolean> {

        const result = await BlogModel.updateOne({id: id}, {$set: {name: name, description:description, websiteUrl:websiteUrl  }})
        return result.matchedCount === 1

    },


    async deleteBlog(id: string): Promise<boolean> {
        const result = await BlogModel.deleteOne({id: id})
        return result.deletedCount === 1
        // если 1 сработало. если 0, то нет
    },


    async deleteAllBlogs(): Promise<boolean> {
        const result = await BlogModel.deleteMany({})
        return result.acknowledged
        // если всё удалит, вернет true
    }
}



