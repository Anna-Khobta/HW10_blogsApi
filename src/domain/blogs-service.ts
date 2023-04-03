import {blogsRepository} from "../repositories/blogs-db-repositories";
import {BlogType} from "../repositories/types";

export const blogsService= {

    async createBlog(name: string,
                     description: string, websiteUrl: string): Promise<BlogType | null> {
        const newBlog= {
            id: (+(new Date())).toString(),
            name: name,
            description: description,
            websiteUrl: websiteUrl,
            createdAt: (new Date()).toISOString(),
            isMembership: false
        }


        const newBlogWithoughtID: BlogType | null = await blogsRepository.createBlog(newBlog)
        return newBlogWithoughtID


    },


    async updateBlog(id: string, name: string, description: string, websiteUrl: string ): Promise<boolean> {

        return await blogsRepository.updateBlog(id, name, description, websiteUrl)
    },


    async deleteBlog(id: string): Promise<boolean> {

        return await blogsRepository.deleteBlog(id)
    },


    async deleteAllBlogs(): Promise<boolean> {

        return await blogsRepository.deleteAllBlogs()

    }
}




/*async findBlogs(title: string | null | undefined): Promise<BlogType[]> {

    const filter: any = {}

    if (title) {
        filter.title = {$regex: title}
    }

    return blogsCollection.find((filter),{projection:{_id:0}}).toArray()
},


async findBlogById(id: string): Promise<BlogType | null> {
    let blog: BlogType | null = await blogsCollection.findOne({id: id},{projection:{_id:0}})
    if (blog) {
        return blog
    } else {
        return null
    }
},
*/

