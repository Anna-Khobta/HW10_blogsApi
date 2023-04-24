import {CommentsModelClass} from "./db/db";

import {CommentDBType, LikeStatusesEnum, UserLikeInfo} from "./db/types";
import {HydratedDocument} from "mongoose";


export const commentsRepositories = {

    async saveComment(commentInstance: HydratedDocument<CommentDBType>): Promise<boolean> {
        try {
            await commentInstance.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }

    },

    /* async createComment(newComment: CommentDBType): Promise<CommentDBType> {
         await CommentsModelClass.insertOne({...newComment})
         return newComment
     },*/


    async findCommentById(id: string): Promise<CommentDBType | null> {
        let foundCommentById = await CommentsModelClass.findOne({_id: id})

        return foundCommentById || null
    },

    async updateComment(id: string, content: string): Promise<string | null> {

        const commentInstance = await CommentsModelClass.findOne({_id: id})

        if (!commentInstance) {
            return null
        }

        commentInstance.content = content;

        try {
            await commentInstance.save()
            return commentInstance._id.toString()
        } catch (error) {
            console.log(error)
            return null
        }
    },

    async deleteComment(id: string): Promise<boolean> {

        const result = await CommentsModelClass.findOneAndDelete({_id: id})
        return result !== null
    },


    async deleteAllComments(): Promise<number> {
        const result = await CommentsModelClass.deleteMany({})
        return result.deletedCount
    },

    async updateLikesCountInComment(commentId: string, likes: number, dislikes: number): Promise<boolean> {

        const commentInstance = await CommentsModelClass.findOne({_id: commentId})

        if (!commentInstance) {
            return false
        }

        commentInstance.likesCount = likes;
        commentInstance.dislikesCount = dislikes;

        try {
            await commentInstance.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }

    },

    async addUserLikeInfoInDb(commentId: string, userLikeInfo: UserLikeInfo, likeStatus: LikeStatusesEnum): Promise<boolean> {

        let userLikeInfoToAdd: UserLikeInfo = {
            userId: userLikeInfo.userId,
            createdAt: userLikeInfo.createdAt,
            userStatus: likeStatus
        }

        const commentInstance = await CommentsModelClass.findOne({_id: commentId})

        if (!commentInstance) {
            return false
        }

        commentInstance.usersEngagement.push(userLikeInfoToAdd)


        try {
            await commentInstance.save();
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },

    async deleteUserInfo(commentId: string, userLikeInfo: UserLikeInfo, likeStatus: LikeStatusesEnum): Promise<boolean> {

        try {

            const commentInstance = await CommentsModelClass.findOne({_id: commentId})

            if (!commentInstance) {
                return false
            }

            commentInstance.usersEngagement = commentInstance.usersEngagement.filter(user => user.userId !== userLikeInfo.userId);
            await commentInstance.save()

            return true

        } catch (error) {
            console.log(error)
            return false
        }
    }
}