import {CommentsModelClass, PostModelClass,} from "./db/db";
import {LikeStatusesEnum, PostDbType, UserLikeInfo} from "./db/types";
import {HydratedDocument} from "mongoose";


export const postsRepositories = {

    async save(postInstance: HydratedDocument<PostDbType>): Promise<boolean> {
        try {
            await postInstance.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }

    },

    async updatePost(postId: string, title: string, shortDescription: string, content: string): Promise<string | null> {


        /*        const result = await PostModelClass.updateOne({_id: postId}, {$set: {title: title, shortDescription:shortDescription, content:content  }})
                return result.matchedCount === 1*/

        const postInstance = await PostModelClass.findOne({_id: postId})

        if (!postInstance) { return null}

        postInstance.title = title;
        postInstance.shortDescription = shortDescription;
        postInstance.content = content;

        try {
            await postInstance.save()
            return postInstance._id.toString()
        } catch (error) {
            console.log(error)
            return null
        }

    },


    async deletePost(id: string): Promise<boolean> {
        const result = await PostModelClass.findOneAndDelete({_id: id})
        return result !== null

    },

async deleteAllPosts(): Promise<number> {
    const result = await PostModelClass.deleteMany({})
    return result.deletedCount
},


    async createUserLikeInfoInDb(commentId: string, userLikeInfo: UserLikeInfo, likeStatus: LikeStatusesEnum): Promise<boolean> {

        let userLikeInfoToAdd: UserLikeInfo = {
            userId: userLikeInfo.userId,
            createdAt: userLikeInfo.createdAt,
            userStatus: likeStatus
        }

        try {
            const postInstance = await CommentsModelClass.findOne({_id: commentId})

            if (!postInstance) { return false }

            postInstance.usersEngagement.push(userLikeInfoToAdd)
            await postInstance.save();
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },

    async updateUserLikeInfo (postId: string, userLikeInfo: UserLikeInfo, likeStatus: LikeStatusesEnum,
                              likes: number, dislikes: number): Promise<boolean> {

        let userLikeInfoToAdd: UserLikeInfo = {
            userId: userLikeInfo.userId,
            createdAt: userLikeInfo.createdAt,
            userStatus: likeStatus
        }

        try {
            const postInstance = await PostModelClass.findOne({_id: postId, "usersEngagement.userId": userLikeInfo.userId})

            if (!postInstance) { return false}

            let myStatus = postInstance.usersEngagement.find(el => el.userId === userLikeInfoToAdd.userId)

            // myStatus = likeStatus
            // TODO тут надо доделать апдейт статусов

            //myStatus?.userStatus = userLikeInfoToAdd.userStatus;
            //postInstance.usersEngagement.userStatus = userLikeInfoToAdd.userStatus;
            postInstance.likesCount = likes;
            postInstance.dislikesCount = dislikes;

            await postInstance.save();
            return true

        }  catch (error) {
            console.log(error)
            return false
        }
    }

}