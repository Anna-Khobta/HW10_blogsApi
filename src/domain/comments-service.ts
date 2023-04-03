import {CommentDBType, CommentViewType, UserDbType} from "../repositories/types";
import {commentsRepositories} from "../repositories/comments-db-repositories";
import {commentsCollection} from "../repositories/db";

export const commentsService = {

    _mapCommentFromDBToViewType (comment: CommentDBType): CommentViewType{
        return {
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: comment.createdAt
        }
    },

    async createComment(postId: string, content: string, userInfo: UserDbType): Promise<CommentViewType> {

        const commentatorInfo = {
            userId: userInfo.id,
            userLogin: userInfo.accountData.login
        }

        const newComment: CommentDBType = {
            id: (+(new Date())).toString(),
            postId,
            content: content,
            commentatorInfo: commentatorInfo,
            createdAt: (new Date()).toISOString()
        }
        const newCommentToDb = await commentsRepositories.createComment(newComment)
        return this._mapCommentFromDBToViewType(newCommentToDb)


    },


    async checkUser(userInfo: UserDbType, id: string): Promise<boolean | undefined> {

        const commentatorInfo = {
            userId: userInfo.id,
            userLogin: userInfo.accountData.login
        }

        const foundCommentOwner = await commentsCollection.findOne({id: id}, {projection: {_id: 0}})

        // как сравнить 2 объекта лучше?

        if (foundCommentOwner) {
            if (foundCommentOwner.commentatorInfo.userId === commentatorInfo.userId &&
                foundCommentOwner.commentatorInfo.userLogin === commentatorInfo.userLogin) {
                return true
            }
        }

    },

    async updateComment(id: string, content: string): Promise<boolean | undefined> {

        let foundCommentById = await commentsRepositories.findCommentById(id)

        if (foundCommentById) {

            return await commentsRepositories.updateComment(id, content)
        }
    },

    async deleteComment(id: string): Promise<boolean> {

        return commentsRepositories.deleteComment(id)
    },

    async deleteAllComments(): Promise<boolean> {
        return commentsRepositories.deleteAllComments()

    }
}