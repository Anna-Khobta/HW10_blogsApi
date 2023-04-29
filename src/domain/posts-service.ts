import {PostsDbRepository} from "../repositories/posts-db-repository";
import {LikeStatusesEnum, PostDbType, PostViewType, UserLikeInfo, UserViewType} from "../repositories/db/types";
import {blogsQueryRepository} from "../repositories/blogs-query-repository";
import {PostsQueryRepository} from "../repositories/posts-query-repository";
import {PostModelClass} from "../repositories/db/db";
import {inject, injectable} from "inversify";

@injectable()
export class PostsService {
    constructor(@inject(PostsQueryRepository) protected postQueryRepository: PostsQueryRepository,
                @inject(PostsDbRepository) protected postsDbRepository: PostsDbRepository) {}

    async createPost(title: string, shortDescription: string, content: string,
                     blogId: string): Promise<string | null> {

        let foundBlogName = await blogsQueryRepository.findBlogName(blogId)

        if (!foundBlogName) {
            return null
        }

        let newPost = new PostDbType (title, shortDescription, content, blogId, foundBlogName.name)

        const postInstance = new PostModelClass(newPost)
        await this.postsDbRepository.save(postInstance)

        return postInstance._id.toString()
    }

    async updatePost(postId: string, title: string, shortDescription: string, content: string,
                     blogId: string): Promise<string | null> {

        let foundPostId = await this.postQueryRepository.findPostById(postId)
        let foundBlogName = await blogsQueryRepository.findBlogName(blogId)

        if (!foundPostId || !foundBlogName) {
            return null
        }

        const updatedPostId = await this.postsDbRepository.updatePost(postId, title, shortDescription, content)

        if (!updatedPostId) {
            return null
        }

        return updatedPostId
    }

    async deletePost(id: string): Promise<boolean> {
        return this.postsDbRepository.deletePost(id)
    }

    async deleteAllPosts(): Promise<number> {
        return this.postsDbRepository.deleteAllPosts()

    }

    async createLikeStatus(userInfo: UserViewType, foundPost: PostViewType, postId: string, likeStatus: LikeStatusesEnum): Promise<boolean> {

        const checkIfUserHaveAlreadyPutLike: LikeStatusesEnum | null = await this.postQueryRepository.checkUserLike(postId, userInfo.id)

        let userLikeInfo: UserLikeInfo = {
            userId: userInfo.id,
            createdAt: (new Date()).toISOString(),
            userStatus: checkIfUserHaveAlreadyPutLike || likeStatus
        }

        let likes = foundPost.extendedLikesInfo.likesCount
        let dislikes = foundPost.extendedLikesInfo.dislikesCount

        //если пользователь ранее не лайкал вообще этот пост
        if (!checkIfUserHaveAlreadyPutLike) {
            return await this.postsDbRepository.createUserLikeInfoInDb(postId, userLikeInfo, likeStatus, likes, dislikes)

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

            return await this.postsDbRepository.updateUserLikeInfo(postId, userLikeInfo, likeStatus, likes, dislikes);
        }
    }
}


//export const postsService = new PostsService()