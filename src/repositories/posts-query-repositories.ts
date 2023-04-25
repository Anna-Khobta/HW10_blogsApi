import {PostModelClass, UserModelClass} from "./db/db";
import {LikeStatusesEnum, NewestLikesType, PostsWithPagination, PostViewType} from "./db/types";
import {SortOrder} from "mongoose";

export const last3UsersLikes = async (postId: string) => {

    const postWithLikes = await PostModelClass.find(
        {_id: postId, "usersEngagement.userStatus": LikeStatusesEnum.Like},
        {_id: 0, __v: 0}
    )
        .sort({"usersEngagement.createdAt": "desc"})
        .lean();

    console.log(postWithLikes, "postWithLikes __ UPPER  ")


    let mappedLikes: NewestLikesType[] = []

    if (postWithLikes.length > 0) {
        if (postWithLikes[0].usersEngagement.length > 0) {

            const filteredLikes = postWithLikes[0].usersEngagement.filter(user => user.userStatus === 'Like')
            const last3Likes = filteredLikes.slice(-3)
            const reverse = last3Likes.reverse()

            //console.log(reverse, "userLikeForMap  __ with user  ")

            mappedLikes = await Promise.all(reverse.map(async element => {

                const foundLogins = await UserModelClass.find({_id: element.userId}, {"accountData.login": 1})

                return {
                    addedAt: element.createdAt,
                    userId: element.userId,
                    login: foundLogins[0]?.accountData?.login
                }

            }))
        }
        return mappedLikes

    } else { return mappedLikes }
}

export const postsQueryRepositories = {

    async findPosts(page: number, limit: number, sortDirection: SortOrder, sortBy: string, skip: number): Promise<PostsWithPagination> {

        // TODO Promise<any> !

        let foundPosts = await PostModelClass.find(
            {},
            {__v: 0})
            .skip(skip)
            .limit(limit)
            .sort({[sortBy]: sortDirection})
            .lean()

        console.log(foundPosts, "foundPosts")

        const mappedPosts= await Promise.all(foundPosts.map(async post => {

            const likers = await last3UsersLikes(post._id.toString())

            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.likesCount,
                    dislikesCount: post.dislikesCount,
                    myStatus: LikeStatusesEnum.None,
                    newestLikes: likers
                }
            }
        }))

        console.log(mappedPosts, "mappedPosts")


        const total = await PostModelClass.countDocuments()
        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: mappedPosts
        }

    },

    async findPostById(createdId: string): Promise<PostViewType | null> {

        try {
            const post = await PostModelClass.findById(createdId).lean()

            if (!post) {
                return null
            }

            const likers = await last3UsersLikes(post._id.toString())

            const postView = {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: post.likesCount,
                    dislikesCount: post.dislikesCount,
                    myStatus: LikeStatusesEnum.None,
                    newestLikes: likers
                }
            }

            return postView
        } catch (error) {
            return null
        }
    },

    async findPostByIdNew(postId: string, userId: string): Promise<any | null> {

        const postInstance = await PostModelClass.findById({_id: postId},{__v: 0})

        if (!postInstance) {
            return null
        }

        let myStatus

        const userLikeInfo = postInstance.usersEngagement.find(
                (user) => user.userId === userId);

            if (!userLikeInfo) {
                myStatus = LikeStatusesEnum.None;
            } else {
                myStatus = userLikeInfo.userStatus
            }



        const postWithLikes = await PostModelClass.find(
            {_id: postId, "usersEngagement.userStatus": LikeStatusesEnum.Like},
            {_id: 0, __v: 0}
        )
            .sort({"usersEngagement.createdAt": "desc"})
            .lean();

        //console.log(postWithLikes, "postWithLikes __ with user ")


        let mappedLikes: NewestLikesType[] = []

        if (postWithLikes.length > 0) {
            if (postWithLikes[0].usersEngagement.length > 0) {

                const filteredLikes = postWithLikes[0].usersEngagement.filter(user => user.userStatus === 'Like')
                const last3Likes = filteredLikes.slice(-3)
                const reverse = last3Likes.reverse()

                //console.log(reverse, "userLikeForMap  __ with user  ")

                mappedLikes = await Promise.all(reverse.map(async element => {

                    const foundLogins = await UserModelClass.find({_id: element.userId}, {"accountData.login": 1})

                    return {
                        addedAt: element.createdAt,
                        userId: element.userId,
                        login: foundLogins[0]?.accountData?.login
                    }

                }))
            }
        }



        // если у нас нет userID
        //TODO mmm

        const postView = {
            id: postId,
            title: postInstance.title,
            shortDescription: postInstance.shortDescription,
            content: postInstance.content,
            blogId: postInstance.blogId,
            blogName: postInstance.blogName,
            createdAt: postInstance.createdAt,
            extendedLikesInfo: {
                likesCount: postInstance.likesCount,
                dislikesCount: postInstance.dislikesCount,
                myStatus: myStatus,
                newestLikes: mappedLikes
            }
        }

        return postView

    },
    async findPostWithoutUser(postId: string): Promise<any | null> {

        const postInstance = await PostModelClass.findById({_id: postId},{__v: 0})

        if (!postId) {
            return null
        }

        if (!postInstance) { return null }

        const postWithLikes = await PostModelClass.find(
            {_id: postId, "usersEngagement.userStatus": "Like"},
            {_id: 0, __v: 0}
        )
            .sort({"usersEngagement.createdAt": "desc"})
            .limit(3)
            .lean();

       // console.log(postWithLikes, "postWithLikes1 _ findPostWithoutUser")

        let mappedLikes: NewestLikesType[] = []

        if (postWithLikes.length > 0) {
            if (postWithLikes[0].usersEngagement.length > 0) {

                const filteredLikes = postWithLikes[0].usersEngagement.filter(user => user.userStatus === 'Like')
                const last3Likes = filteredLikes.slice(-3)
                const reverse = last3Likes.reverse()

                   // console.log(reverse, "last3Likes __without user ")

                mappedLikes = await Promise.all(reverse.map(async element => {

                    const foundLogins = await UserModelClass.find({_id: element.userId}, {"accountData.login": 1})

                    return {
                        addedAt: element.createdAt.toString(),
                        userId: element.userId,
                        login: foundLogins[0]?.accountData?.login
                    }
                }))
            }
        }

      //  console.log(mappedLikes, "mappedLikes _ without user id")


        const postView = {
            id: postId,
            title: postInstance.title,
            shortDescription: postInstance.shortDescription,
            content: postInstance.content,
            blogId: postInstance.blogId,
            blogName: postInstance.blogName,
            createdAt: postInstance.createdAt,
            extendedLikesInfo: {
                likesCount: postInstance.likesCount,
                dislikesCount: postInstance.dislikesCount,
                myStatus: LikeStatusesEnum.None,
                newestLikes: mappedLikes
            }
        }

        return postView

    },



    async findPostsByBlogId(blogId: string, page: number, limit: number, sortDirection: SortOrder, sortBy: string, skip: number):
        Promise<PostsWithPagination> {
        let findPosts
            :
            PostViewType[] = await PostModelClass.find(
            {blogId: blogId},
            {projection: {_id: 0}})
            .skip(skip)
            .limit(limit)
            .sort({sortBy: sortDirection})
            .lean()

        const total = await PostModelClass.countDocuments({blogId: blogId})
        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: findPosts
        }
    },

    async checkUserLike(postId: string, userId: string):
        Promise<LikeStatusesEnum | null> {

        try {

            const postInstance = await PostModelClass.findOne({_id: postId})

            //console.log(postInstance)

            if (!postInstance
            ) {
                return null
            }

            const userLikeInfo = postInstance.usersEngagement.find(
                (user) => user.userId === userId
            );

//console.log(userLikeInfo, 'userLikeInfo')

            if (!userLikeInfo) {
                return null;
            }
            return userLikeInfo.userStatus
        } catch
            (error) {
            console.log(error);
            return null;
        }
    }
}