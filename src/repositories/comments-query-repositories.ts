import {SortDirection} from "mongodb";
import {commentsCollection} from "./db/db";
import {CommentDBType, LikeStatusType} from "./db/types";


export const commentsQueryRepositories = {

    async findCommentsForPost (postId: string, page: number, limit:number,
                               sortDirection: SortDirection,
                               sortBy: string, skip: number) {

        const filter = {postId}
        const findComments = await commentsCollection.find({postId: postId})
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray()

        const total = await commentsCollection.countDocuments(filter)
        const pagesCount = Math.ceil(total/limit)

/*        const items = findUsers.map(user => ({
            id: user.id,
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }));*/

      /*  const items: CommentViewType[] = findComments.map(async (comment) => {
            const myStatus = await commentsQueryRepositories.checkUserLike(comment.id, userId);

            return {
                id: comment.id,
                content: comment.content,
                commentatorInfo: {
                    userId: comment.commentatorInfo.userId,
                    userLogin: comment.commentatorInfo.userLogin
                },
                createdAt: comment.createdAt,
                likesInfo: {
                    likesCount: comment.likesInfo.likesCount,
                    dislikesCount: comment.dislikesInfo.dislikesCount,
                    myStatus: myStatus
                }
            };
        });*/

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findComments
        }
    },

    async findCommentById(id: string): Promise<CommentDBType | null> {

        const foundComment: CommentDBType | null = await commentsCollection.findOne({id: id})

        if (!foundComment) {return null}

        return foundComment

    },

    async checkUserLike (commentId: string, userId: string): Promise<LikeStatusType> {

        const checkUserLikeInComment = await commentsCollection.findOne({ id: commentId, "likesInfo.usersPutLikes.userId": userId})

        if (checkUserLikeInComment) {
            return "Like"
        }

        const checkUserDislikeInComment = await commentsCollection.findOne({ id: commentId, "dislikesInfo.usersPutDislikes.userId": userId})

        if (checkUserDislikeInComment) {
            return "Dislike"
        }

        return "None"

    }
}