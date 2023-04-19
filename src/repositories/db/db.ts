import {MongoClient} from "mongodb";
import {CommentDBType, ipDbType, TokenDBType} from "./types";

import mongoose from 'mongoose'
import {blogSchema, commentSchema, postSchema, userSchema} from "./schemas";

export const mongoUri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017"
const dbName = "blogs-api"

if (!mongoUri) { throw new Error("❗️ Url doesn't found") }

export const client = new MongoClient(mongoUri)
const db = client.db(dbName)

export const BlogModelClass = mongoose.model('Blogs', blogSchema); //export const blogsCollection = db.collection<BlogType>("Blogs");
// TODO сделать _id в id
export const PostModelClass = mongoose.model('Posts', postSchema )

export const UserModelClass = mongoose.model('Users', userSchema )


/*

interface CommentModelInterface extends Document {
    postId: string;
    content: string;
    createdAt: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    likesCount: number;
    dislikesCount: number;
    usersEngagement: {
        userId: string;
        createdAt: string;
        userStatus: LikeStatusesEnum;
    }[];

}


// add the static method to the schema
*/


export const CommentsModelClass = mongoose.model<CommentDBType>('Comment', commentSchema);




//export const commentsCollection = db.collection<CommentDBType>("Comments")

//export const usersCollection = db.collection<UserDbType>("Users");
export const tokensCollection = db.collection<TokenDBType>("tokensCollection");
export const ipCollection = db.collection<ipDbType>("ipCollection");

export async function runDb () {
    try {
        //connect the client to the server
        await client.connect()
        await mongoose.connect(mongoUri!);

        // esteblish and verufy connection
        await db.command({ ping: 1});
        console.log(" ✅ Connected successfully to mongo server");

    } catch {
        console.log(" ❗️ Can't connect to db");
        // Ensure that the client will close when you finish/error
        await client.close();
        await mongoose.disconnect()
    }
}