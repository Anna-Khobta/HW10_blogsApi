import {postsRepositories} from "../repositories/posts-db-repositories";
import {PostType} from "../repositories/types";

export const postsService = {

    async createPost(title: string, shortDescription: string, content: string,
                     blogId: string): Promise<PostType | null | undefined> {

        let foundBlogName = await postsRepositories.findBlogName(blogId)


        if (foundBlogName) {
            const newPost = {
                id: (+(new Date())).toString(),
                title: title,
                shortDescription: shortDescription,
                content: content,
                blogId: blogId,
                blogName: foundBlogName.name,
                createdAt: (new Date()).toISOString(),
            }
            const newPostInDb = await postsRepositories.createPost(newPost)

            return newPostInDb


        }},

    async updatePost(id: string, title: string, shortDescription: string, content: string,
                     blogId: string): Promise<boolean | undefined> {

        let foundPostId = await postsRepositories.findPostById(id)
        let foundBlogName = await postsRepositories.findBlogName(blogId)

        if (foundPostId && foundBlogName) {

        return await postsRepositories.updatePost (id, title, shortDescription,
            content)
        }
    },

    async deletePost(id: string): Promise<boolean> {

       return postsRepositories.deletePost(id)
    },

    async deleteAllPosts(): Promise<boolean> {
        return postsRepositories.deleteAllPosts()

    }
}



/*async findPosts(title: string | null | undefined): Promise<PostType[]> {
    const filter: any = {}

    if (title) {
        filter.title = {$regex: title}
    }
    return postsCollection.find((filter), {projection: {_id: 0}}).toArray()
},


async findPostById(id: string): Promise<PostType | null> {
    let post: PostType | null = await postsCollection.findOne({id: id}, {projection: {_id: 0}})
    if (post) {
        return post
    } else {
        return null
    }
},*/
