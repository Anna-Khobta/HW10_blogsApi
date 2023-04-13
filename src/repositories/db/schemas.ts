import mongoose from "mongoose";
import {PostDbType, UserDbType} from "./types";

export const blogSchema = new mongoose.Schema({
    id: String,
    name: {type: String, require: true},
    description: String,
    websiteUrl: String,
    createdAt: String,
    isMembership: Boolean
});

export const postSchema = new mongoose.Schema<PostDbType>( {
    //id: String,
    title: String,
    shortDescription: String,
    content: String,
    blogId: String,
    blogName: String,
    createdAt: String
})

export const userSchema = new mongoose.Schema<UserDbType>({
    //id: string,
    accountData: {
    login: String,
        email: String,
        hashPassword: String,
        createdAt: String
},
emailConfirmation: {
    confirmationCode: String,
        expirationDate: Date,
        isConfirmed: Boolean
},
passwordRecovery: {
    recoveryCode: String || null,
        exp: Date || null
    }
})