import {blogsCollection, postsCollection} from "./db";

import {BlogType, PostType} from "./types";


export const postsRepositories = {

    async findPosts(title: string | null | undefined): Promise<PostType[]> {
        const filter: any = {}

        if (title) {
            filter.title = {$regex: title}
        }
        return postsCollection.find((filter), {projection: {_id: 0}}).toArray()
    },

    // TO DO вынести блог в блоги или отдельно
    async findBlogName(blogId: string): Promise <BlogType | null> {

        let foundBlogName = await blogsCollection.findOne({id: blogId}, {projection: {_id: 0}})

        return foundBlogName || null
    },

    async findPostById (id: string): Promise <PostType | null> {
        let foundPostById = await postsCollection.findOne({id: id}, {projection: {_id: 0}})
        return foundPostById || null
    },


    async createPost(newPost: PostType): Promise<PostType | null | undefined> {

    await postsCollection.insertOne(newPost)

        const newPostWithoughtID= postsCollection.findOne({id: newPost.id},{projection:{_id:0}})

        return newPostWithoughtID

    },

    async updatePost(id: string, title: string, shortDescription: string, content: string): Promise<boolean | undefined> {

    const updatedPost = await postsCollection.updateOne({id: id},
        {$set: {title: title,
                shortDescription: shortDescription,
                content: content }})

    return updatedPost.matchedCount === 1

    },


    async deletePost(id: string): Promise<boolean> {

        const result = await postsCollection.deleteOne({id: id})
        return result.deletedCount === 1
        // если 1 сработало. если 0, то нет
    },

async deleteAllPosts(): Promise<boolean> {
    const result = await postsCollection.deleteMany({})
    return result.acknowledged
    // если всё удалит, вернет true
}
}