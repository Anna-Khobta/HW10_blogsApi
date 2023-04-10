import mongoose from "mongoose";

export const blogSchema = new mongoose.Schema({
    id: String,
    name: {type: String, require: true},
    description: String,
    websiteUrl: String,
    createdAt: String,
    isMembership: Boolean
});

export const postSchema = new mongoose.Schema( {
    id: String,
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: String
})