import {PostModelClass, UserModelClass} from "../repositories/db/db";
import {LikeStatusesEnum, NewestLikesType} from "../repositories/db/types";

export const last3UsersLikes = async (postId: string) => {

    const postWithLikes = await PostModelClass.find(
        {_id: postId, "usersEngagement.userStatus": LikeStatusesEnum.Like},
        {_id: 0, __v: 0}
    )
        .sort({"usersEngagement.createdAt": "asc"})
        .lean();

    let mappedLikes: NewestLikesType[] = []

    if (postWithLikes.length > 0) {
        if (postWithLikes[0].usersEngagement.length > 0) {

            const filteredLikes = postWithLikes[0].usersEngagement.filter(user => user.userStatus === 'Like')
            const last3Likes = filteredLikes.slice(-3)
            const reverse = last3Likes.reverse()

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
    } else {
        return mappedLikes
    }
}
