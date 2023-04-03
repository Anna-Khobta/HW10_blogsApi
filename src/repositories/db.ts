import {MongoClient} from "mongodb";
import {BlogType, CommentDBType, ipDbType, PostType, TokenDBType, UserDbType} from "./types";


const mongoUri = process.env.MONGO_URL

if (!mongoUri) {
    throw new Error("❗️ Url doesn't found")
}


const client = new MongoClient(mongoUri)
const db = client.db(); // const db = client.db("BlogsApi")
export const blogsCollection = db.collection<BlogType>("Blogs");
export const postsCollection = db.collection<PostType>("Posts");
export const usersCollection = db.collection<UserDbType>("Users");
export const tokensCollection = db.collection<TokenDBType>("tokensCollection");

export const ipCollection = db.collection<ipDbType>("ipCollection");

//export const authCollection = db.collection<UserDbType>("Users");



export const commentsCollection = db.collection<CommentDBType>("Comments")

export async function runDb () {
    try {
        // connect the client to the server
        await client.connect()
        // esteblish and verufy connection
        await db.command({ ping: 1});
        console.log(" ✅ Connected successfully to mongo server");

    } catch {
        console.log(" ❗️ Can't connect to db");
        // Ensure that the client will close when you finish/error
        await client.close();
    }
}