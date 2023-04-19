import {CommentsModelClass} from "./db/db";
import {CommentViewType, LikeStatusesEnum} from "./db/types";
import {SortOrder} from "mongoose";


export const commentsQueryRepositories = {

    async findCommentsForPost (postId: string, page: number, limit:number,
                               sortDirection: SortOrder,
                               sortBy: string, skip: number) {

        const filter = {postId}

        const findComments = await CommentsModelClass.find(
            {postId: postId},
            {__v: 0})
            .skip(skip)
            .limit(limit)
            .sort({sortBy: sortDirection})
            .lean()


        const mappedComments = findComments.map(comment => {
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
                    myStatus: "None" // Set the default value for myStatus
                }
            }
        })


        const total = await CommentsModelClass.countDocuments(filter)
        const pagesCount = Math.ceil(total/limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: mappedComments
        }
    },


    async findCommentsForPostWithUser (postId: string, page: number, limit:number,
                               sortDirection: SortOrder,
                               sortBy: string, skip: number, userId: string) {

        const filter = {postId}

        const findComments = await CommentsModelClass.find(
            {postId: postId},
            {__v: 0})
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(limit)
            .lean()

        const mappedComments = findComments.map((comment) => {
            const myStatus = comment.usersEngagement.find(el => el.userId === userId)
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
                    myStatus: myStatus?.userStatus || 'None'
                }
            }
        })


        const total = await CommentsModelClass.countDocuments(filter)
        const pagesCount = Math.ceil(total/limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: mappedComments
        }
    },


    async findCommentById(commentId: string): Promise<CommentViewType | null> {

        try {
            const foundComment = await CommentsModelClass.findById(commentId).lean()
            if (!foundComment) {return null}

            return {
                id: commentId,
                content: foundComment.content,
                commentatorInfo: {
                    userId: foundComment.commentatorInfo.userId,
                    userLogin: foundComment.commentatorInfo.userLogin,
                },
                createdAt: foundComment.createdAt,
                likesInfo: {
                    likesCount: foundComment.likesCount,
                    dislikesCount: foundComment.dislikesCount,
                    myStatus: "None"
                }
            }

        } catch (error) {
            return null
        }

        },

    async checkUserLike (commentId: string, userId: string): Promise<LikeStatusesEnum> {

        try {

            const commentInstance = await CommentsModelClass.findById({_id: commentId})

            const userLikeInfo = commentInstance!.usersEngagement.find(
                (user) => user.userId === userId
            );

            if (!userLikeInfo) {
                return LikeStatusesEnum.None;
            }
            return userLikeInfo.userStatus
        } catch (error) {
            console.log(error);
            return LikeStatusesEnum.None;
        }
    }
}