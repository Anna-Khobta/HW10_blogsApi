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

        console.log(findComments)

        const total = await CommentsModelClass.countDocuments(filter)
        const pagesCount = Math.ceil(total/limit)


        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findComments
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