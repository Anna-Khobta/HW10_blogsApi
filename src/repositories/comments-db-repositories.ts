import {commentsCollection} from "./db/db";

import {CommentDBType, LikeStatusType, UserLikeInfo} from "./db/types";


export const commentsRepositories = {

    async createComment(newComment: CommentDBType): Promise<CommentDBType> {
        await commentsCollection.insertOne({...newComment})
        return newComment
    },


    async findCommentById(id: string): Promise<CommentDBType | null> {
        let foundCommentById = await commentsCollection.findOne({id: id}, {projection: {_id: 0}})
        return foundCommentById || null
    },

    async updateComment(id: string, content: string): Promise<boolean | undefined> {

        const updatedComment = await commentsCollection.updateOne({id: id},
            {$set: {content: content}})

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

    async updateLikesInComment(commentId: string, likes: number, dislikes: number): Promise<boolean> {

        const updatedComment = await commentsCollection.updateOne({id: commentId},
            {
                $set: {
                    "likesInfo.likesCount": likes,
                    "dislikesInfo.dislikesCount": dislikes
                }
            })

        return updatedComment.matchedCount === 1
    },

    async createUserInfo(commentId: string, userLikeInfo: UserLikeInfo, likeStatus: LikeStatusType): Promise<boolean> {

        try {
            if (likeStatus === "Like") {
                const updatedComment = await commentsCollection.updateOne({id: commentId},
                    {$push: {"likesInfo.usersPutLikes": userLikeInfo}})
                return updatedComment.matchedCount === 1
            }

            if (likeStatus === "Dislike") {
                const updatedComment = await commentsCollection.updateOne({id: commentId},
                    {$push: {"dislikesInfo.usersPutDislikes": userLikeInfo}})
                return updatedComment.matchedCount === 1
            } else {
                return false
            }

        } catch (error) {
            console.log(error)
            return false
        }
    },

    async deleteUserInfo(commentId: string, userLikeInfo: UserLikeInfo, likeStatus: LikeStatusType): Promise<boolean> {

        try {
            if (likeStatus === "Like") {
                const deleteUserLike = await commentsCollection.updateOne({id: commentId},
                    {$pull: {"likesInfo.usersPutLikes": {userId: userLikeInfo.userId}}})
                return deleteUserLike.matchedCount === 1
            }

            if (likeStatus === "Dislike") {
                const deleteUserDislike = await commentsCollection.updateOne({id: commentId},
                    {$pull: {"dislikesInfo.usersPutDislikes": {userId: userLikeInfo.userId}}})
                return deleteUserDislike.matchedCount === 1
            } else {
                return false
            }
        } catch (error) {
            console.log(error)
            return false
        }

    }
}