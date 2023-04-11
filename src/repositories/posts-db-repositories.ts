import {PostModelClass,} from "./db";
import {PostDbType} from "../type/types";
import {HydratedDocument} from "mongoose";


export const postsRepositories = {

    async save(postInstance: HydratedDocument<PostDbType>): Promise<boolean> {
        try {
            await postInstance.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }

    },

    async updatePost(postId: string, title: string, shortDescription: string, content: string): Promise<string | null> {


        /*        const result = await PostModelClass.updateOne({_id: postId}, {$set: {title: title, shortDescription:shortDescription, content:content  }})
                return result.matchedCount === 1*/

        const postInstance = await PostModelClass.findOne({_id: postId})

        if (!postInstance) { return null}

        postInstance.title = title;
        postInstance.shortDescription = shortDescription;
        postInstance.content = content;

        try {
            await postInstance.save()
            return postInstance._id.toString()
        } catch (error) {
            console.log(error)
            return null
        }

    },


    async deletePost(id: string): Promise<boolean> {

        const result = await PostModelClass.findOneAndDelete({_id: id})
        return result !== null

    },

async deleteAllPosts(): Promise<number> {
    const result = await PostModelClass.deleteMany({})
    return result.deletedCount
    // если всё удалит, вернет true
}
}