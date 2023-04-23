import {
    CommentDBType,
    CommentViewType,
    CommentWithMongoId,
    LikeStatusesEnum,
    UserLikeInfo,
    UserViewType
} from "../repositories/db/types";
import {commentsRepositories} from "../repositories/comments-db-repositories";
import {CommentsModelClass} from "../repositories/db/db";
import {commentsQueryRepositories} from "../repositories/comments-query-repositories";

export const commentsService = {

    _mapCommentFromDBToViewType(comment: CommentWithMongoId): CommentViewType {
        return {
            id: comment._id.toString(),
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: comment.likesCount,
                dislikesCount: comment.dislikesCount,
                myStatus: LikeStatusesEnum.None
            }
        }
    },

    async createComment(postId: string, content: string, userInfo: UserViewType): Promise<CommentViewType> {

        const commentatorInfo = {
            userId: userInfo.id,
            userLogin: userInfo.login
        }

        const newComment: CommentDBType = {
            //id: (+(new Date())).toString(),
            postId: postId,
            content: content,
            createdAt: (new Date()).toISOString(),
            commentatorInfo: commentatorInfo,
            likesCount: 0,
            dislikesCount: 0,
            usersEngagement: []
        }

        const commentInstance = new CommentsModelClass(newComment)
        await commentsRepositories.saveComment(commentInstance)

        /*        return commentInstance._id.toString()

                const newCommentToDb = await commentsRepositories.createComment(newComment)*/

        return this._mapCommentFromDBToViewType(commentInstance)

    },


    async checkUser(userInfo: UserViewType, id: string): Promise<boolean | undefined> {

        const commentatorInfo = {
            userId: userInfo.id,
            userLogin: userInfo.login
        }

        const foundCommentOwner = await CommentsModelClass.findOne({_id: id}).lean()

        // как сравнить 2 объекта лучше?

        if (foundCommentOwner) {
            if (foundCommentOwner.commentatorInfo.userId === commentatorInfo.userId &&
                foundCommentOwner.commentatorInfo.userLogin === commentatorInfo.userLogin) {
                return true
            }
        }
    },

    async updateComment(id: string, content: string): Promise<boolean> {

        let foundCommentById = await commentsRepositories.findCommentById(id)

        if (!foundCommentById) {
            return false
        }

        const updateComment = await commentsRepositories.updateComment(id, content)

        if (!updateComment) {
            return false
        }

        return true

    },

    async deleteComment(id: string): Promise<boolean> {

        return commentsRepositories.deleteComment(id)
    },

    async deleteAllComments(): Promise<number> {
        return commentsRepositories.deleteAllComments()

    },

    async createLikeStatus(userInfo: UserViewType, comment: CommentViewType, commentId: string, likeStatus: LikeStatusesEnum): Promise<boolean> {

        // вернется статус пользователя в формате enam
        const checkIfUserHaveAlreadyPutLike: LikeStatusesEnum | null = await commentsQueryRepositories.checkUserLike(commentId, userInfo.id)


        if (!checkIfUserHaveAlreadyPutLike) {
            return false
        }
        // новая строчка. если произошла ошибка в бд, вернется null

        let likes = comment.likesInfo.likesCount
        let dislikes = comment.likesInfo.dislikesCount


        let userLikeInfo: UserLikeInfo = {
            userId: userInfo.id,
            createdAt: (new Date()).toISOString(),
            userStatus: checkIfUserHaveAlreadyPutLike || LikeStatusesEnum.None
        }
        if (checkIfUserHaveAlreadyPutLike === likeStatus) return true

        if (checkIfUserHaveAlreadyPutLike === "None") {
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
            await commentsRepositories.addUserLikeInfoInDb(commentId, userLikeInfo, likeStatus)
        }


        if (checkIfUserHaveAlreadyPutLike === "Like") {
            switch (likeStatus) {
                case "Dislike":
                    likes--;
                    dislikes++;
                    await commentsRepositories.deleteUserInfo(commentId, userLikeInfo, checkIfUserHaveAlreadyPutLike)
                    await commentsRepositories.addUserLikeInfoInDb(commentId, userLikeInfo, likeStatus)
                    break;
                default:
                    likes--;
                    await commentsRepositories.deleteUserInfo(commentId, userLikeInfo, checkIfUserHaveAlreadyPutLike)
                    break;
            }
        }

        if (checkIfUserHaveAlreadyPutLike === "Dislike") {
            switch (likeStatus) {
                case "Like":
                    likes++;
                    dislikes--;
                    await commentsRepositories.deleteUserInfo(commentId, userLikeInfo, checkIfUserHaveAlreadyPutLike)
                    await commentsRepositories.addUserLikeInfoInDb(commentId, userLikeInfo, likeStatus)
                    break;
                default:
                    dislikes--;
                    await commentsRepositories.deleteUserInfo(commentId, userLikeInfo, checkIfUserHaveAlreadyPutLike)
                    break;
            }
        }

        await commentsRepositories.updateLikesCountInComment(commentId, likes, dislikes)

        /*        const commentAfter = await commentsCollection.findOne({id: commentId})

                console.log({commentAfter})*/
        return true

    }
}