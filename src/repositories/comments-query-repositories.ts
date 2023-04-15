import {SortDirection} from "mongodb";
import {commentsCollection} from "./db/db";
import {CommentDBType, LikeStatusType} from "./db/types";


export const commentsQueryRepositories = {
    async findCommentsForPost (postId: string, page: number, limit:number,
                               sortDirection: SortDirection,
                               sortBy: string, skip: number) {
        const filter = {postId}
        const findComments = await commentsCollection.find(
            filter,
            {projection: {_id: 0, postId: 0}})
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .toArray()

        const total = await commentsCollection.countDocuments(filter)
        const pagesCount = Math.ceil(total/limit)

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