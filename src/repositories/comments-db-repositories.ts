import {commentsCollection} from "./db";

import {CommentDBType} from "./types";


export const commentsRepositories = {

    async createComment(newComment: CommentDBType): Promise<CommentDBType> {
        await commentsCollection.insertOne({...newComment})
        return newComment
    },


    async findCommentById (id: string): Promise <CommentDBType | null> {
        let foundCommentById = await commentsCollection.findOne({id: id}, {projection: {_id: 0}})
        return foundCommentById || null
    },

    async updateComment(id: string, content: string): Promise<boolean | undefined> {

        const updatedComment = await commentsCollection.updateOne({id: id},
            {$set: {content: content }})

        return updatedComment.matchedCount === 1
    },

    async deleteComment(id: string): Promise<boolean> {

        const result = await commentsCollection.deleteOne({id: id})
        return result.deletedCount === 1
        // если 1 сработало. если 0, то нет
    },


    async deleteAllComments(): Promise<boolean> {
        const result = await commentsCollection.deleteMany({})
        return result.acknowledged
        // если всё удалит, вернет true

    },
}