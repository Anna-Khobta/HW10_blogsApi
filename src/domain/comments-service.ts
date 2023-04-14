import {CommentDBType, CommentViewType, LikeStatusType, UserLikeInfo, UserViewType} from "../repositories/db/types";
import {commentsRepositories} from "../repositories/comments-db-repositories";
import {commentsCollection} from "../repositories/db/db";
import {commentsQueryRepositories} from "../repositories/comments-query-repositories";

export const commentsService = {

    _mapCommentFromDBToViewType(comment: CommentDBType): CommentViewType {
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

    async createComment(postId: string, content: string, userInfo: UserViewType): Promise<CommentViewType> {

        const commentatorInfo = {
            userId: userInfo.id,
            userLogin: userInfo.login
        }

        const likesInfo = {
            likesCount: 0,
            usersPutLikes: null
        }

        const dislikesInfo = {
            dislikesCount: 0,
            usersPutDislikes: null
        }

        const newComment: CommentDBType = {
            id: (+(new Date())).toString(),
            postId,
            content: content,
            commentatorInfo: commentatorInfo,
            createdAt: (new Date()).toISOString(),
            likesInfo: likesInfo,
            dislikesInfo: dislikesInfo
        }
        const newCommentToDb = await commentsRepositories.createComment(newComment)
        return this._mapCommentFromDBToViewType(newCommentToDb)

    },


    async checkUser(userInfo: UserViewType, id: string): Promise<boolean | undefined> {

        const commentatorInfo = {
            userId: userInfo.id,
            userLogin: userInfo.login
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

    },

    async createLikeStatus(userInfo: UserViewType, comment: CommentDBType , likeStatus: LikeStatusType): Promise<boolean> {

        const userLikeInfo: UserLikeInfo = {
            userId: userInfo.id,
            createdAt: (new Date()).toISOString(),
        }

        let likes = comment.likesInfo.likesCount
        let dislikes = comment.dislikesInfo.dislikesCount

        const checkIfUserHaveAlreadyPurLike = await commentsQueryRepositories.checkUserLike(userInfo.id)

        if (checkIfUserHaveAlreadyPurLike === null)  {
            switch (likeStatus) {
                case "Like":
                    likes++;
                    break;
                case "Dislike":
                    dislikes++;
                    break;
                default:
                    break;
            }
            const addUserLikeInfoInComment = await commentsRepositories.createUserInfo(comment.id, userLikeInfo, likeStatus)
        }


        if (checkIfUserHaveAlreadyPurLike === "Like") {
            switch (likeStatus) {
                case "Like":
                    break;
                case "Dislike":
                    likes--;
                    dislikes++;
                    const deleteUserInfoLike = await commentsRepositories.deleteUserInfo(comment.id, userLikeInfo, checkIfUserHaveAlreadyPurLike)
                    const addUserInfoDislike = await commentsRepositories.createUserInfo(comment.id, userLikeInfo, likeStatus)
                    break;
                default:
                    break;
            }
        }

        if (checkIfUserHaveAlreadyPurLike === "Dislike") {
            switch (likeStatus) {
                case "Like":
                    likes++;
                    dislikes--;
                    const deleteUserInfoLike = await commentsRepositories.deleteUserInfo(comment.id, userLikeInfo, checkIfUserHaveAlreadyPurLike)
                    const addUserInfoDislike = await commentsRepositories.createUserInfo(comment.id, userLikeInfo, likeStatus)
                    break;
                case "Dislike":
                    break;
                default:
                    break;
            }
        }

        await commentsRepositories.updateLikesInComment(comment.id, likes, dislikes)

        return true

    }
}