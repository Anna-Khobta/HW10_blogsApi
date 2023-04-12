import {postsRepositories} from "../repositories/posts-db-repositories";
import {PostTypeWithoutIds} from "../type/types";
import {blogsQueryRepository} from "../repositories/blogs-query-repository";
import {postsQueryRepositories} from "../repositories/posts-query-repositories";
import {PostModelClass} from "../repositories/db";



export const postsService = {

    async createPost(title: string, shortDescription: string, content: string,
                     blogId: string): Promise<string | null> {

        let foundBlogName = await blogsQueryRepository.findBlogName(blogId)

        // TODO по идее надо квери вынести в роутер и сюда просто передать имя блога

        if (!foundBlogName) { return null }

            let newPost: PostTypeWithoutIds = {
                // _id: new ObjectId(),
                //id: " ",
                title: title,
                shortDescription: shortDescription,
                content: content,
                blogId: blogId,
                blogName: foundBlogName.name,
                createdAt: (new Date()).toISOString(),
            }

            //const newPostInDb = await postsRepositories.createPost(newPost)

        const postInstance = new PostModelClass(newPost)
        await postsRepositories.save(postInstance)

        const createdId = postInstance._id.toString()

            return createdId
    },

    async updatePost(postId: string, title: string, shortDescription: string, content: string,
                     blogId: string): Promise <string | null> {

        let foundPostId = await postsQueryRepositories.findPostById(postId)
        let foundBlogName = await blogsQueryRepository.findBlogName(blogId)

        if (!foundPostId) { return null }
        if (!foundBlogName) { return null }

            const updatedPostId = await postsRepositories.updatePost(postId, title, shortDescription, content)

        console.log(updatedPostId)

            if (!updatedPostId) { return null}

            return updatedPostId
    },

    async deletePost(id: string): Promise<boolean> {
       return postsRepositories.deletePost(id)
    },

    async deleteAllPosts(): Promise<number> {
        return postsRepositories.deleteAllPosts()

    }
}