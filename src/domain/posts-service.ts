import {postsRepositories} from "../repositories/posts-db-repositories";
import {LikeStatusesEnum, PostDbType, PostViewType, UserLikeInfo, UserViewType} from "../repositories/db/types";
import {blogsQueryRepository} from "../repositories/blogs-query-repository";
import {postsQueryRepositories} from "../repositories/posts-query-repositories";
import {PostModelClass} from "../repositories/db/db";


export const postsService = {

    async createPost(title: string, shortDescription: string, content: string,
                     blogId: string): Promise<string | null> {

        let foundBlogName = await blogsQueryRepository.findBlogName(blogId)


        if (!foundBlogName) {
            return null
        }

        let newPost: PostDbType = {
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
            blogName: foundBlogName.name,
            createdAt: (new Date()).toISOString(),
            likesCount: 0,
            dislikesCount: 0,
            usersEngagement: []
        }

        const postInstance = new PostModelClass(newPost)
        await postsRepositories.save(postInstance)

        return postInstance._id.toString()
    },

    async updatePost(postId: string, title: string, shortDescription: string, content: string,
                     blogId: string): Promise<string | null> {

        let foundPostId = await postsQueryRepositories.findPostById(postId)
        let foundBlogName = await blogsQueryRepository.findBlogName(blogId)

        if (!foundPostId) {
            return null
        }
        if (!foundBlogName) {
            return null
        }

        const updatedPostId = await postsRepositories.updatePost(postId, title, shortDescription, content)


        if (!updatedPostId) {
            return null
        }

        return updatedPostId
    },

    async deletePost(id: string): Promise<boolean> {
        return postsRepositories.deletePost(id)
    },

    async deleteAllPosts(): Promise<number> {
        return postsRepositories.deleteAllPosts()

    },

    async createLikeStatus(userInfo: UserViewType, foundPost: PostViewType, postId: string, likeStatus: LikeStatusesEnum): Promise<boolean> {

        const checkIfUserHaveAlreadyPutLike: LikeStatusesEnum | null = await postsQueryRepositories.checkUserLike(postId, userInfo.id)

        console.log(checkIfUserHaveAlreadyPutLike, "checkIfUserHaveAlreadyPutLike")

        let userLikeInfo: UserLikeInfo = {
            userId: userInfo.id,
            createdAt: (new Date()).toISOString(),
            userStatus: checkIfUserHaveAlreadyPutLike || likeStatus
        }

        let likes = foundPost.extendedLikesInfo.likesCount
        let dislikes = foundPost.extendedLikesInfo.dislikesCount


        //если пользователь ранее не лайкал вообще этот пост
        if (!checkIfUserHaveAlreadyPutLike) {
            return await postsRepositories.createUserLikeInfoInDb(postId, userLikeInfo, likeStatus, likes, dislikes)

        } else {

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

            }


            if (checkIfUserHaveAlreadyPutLike === "Like") {
                switch (likeStatus) {
                    case "Dislike":
                        likes--;
                        dislikes++;
                        break;
                    default:
                        likes--;
                        break;
                }
            }

            if (checkIfUserHaveAlreadyPutLike === "Dislike") {
                switch (likeStatus) {
                    case "Like":
                        likes++;
                        dislikes--;
                        break;
                    default:
                        dislikes--;
                        break;
                }
            }

            return await postsRepositories.updateUserLikeInfo(postId, userLikeInfo, likeStatus, likes, dislikes);
        }




    }
}