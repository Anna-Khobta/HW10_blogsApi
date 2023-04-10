import {MongoClient} from "mongodb";
import {BlogType, CommentDBType, ipDbType, PostType, TokenDBType, UserDbType} from "../type/types";

import mongoose from 'mongoose'


const mongoUri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017"
const dbName = process.env.MONGO_Db_Name || "BlogsApi"

if (!mongoUri) {
    throw new Error("❗️ Url doesn't found") }



const blogSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    websiteUrl: String,
    createdAt: String,
    isMembership: Boolean
});

export const BlogModel = mongoose.model('Blogs', blogSchema);



// export const client = new MongoClient(mongoUri)
// const db = client.db("BlogsApi")

//export const blogsCollection = db.collection<BlogType>("Blogs");
/*export const postsCollection = db.collection<PostType>("Posts");
export const usersCollection = db.collection<UserDbType>("Users");
export const tokensCollection = db.collection<TokenDBType>("tokensCollection");
export const ipCollection = db.collection<ipDbType>("ipCollection");
export const commentsCollection = db.collection<CommentDBType>("Comments")*/

export async function runDb () {
    try {
        // connect the client to the server
        //await client.connect()

        await mongoose.connect(mongoUri + '/' + dbName );

        // esteblish and verufy connection
        //await db.command({ ping: 1});
        console.log(" ✅ Connected successfully to mongo server");

    } catch {
        console.log(" ❗️ Can't connect to db");
        // Ensure that the client will close when you finish/error
        //await client.close();
        await mongoose.disconnect()
    }
}