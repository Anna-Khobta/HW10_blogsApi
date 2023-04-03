
import * as dotenv from 'dotenv'
dotenv.config()
import express, {Request, Response} from 'express'

import {blogsRouter} from "./routers/blogs-router";
import {postsRouter} from "./routers/posts-router";
import {deleteAllRouter} from "./routers/delete-all-routers";
import {usersRouter} from "./routers/users-router";

import {authRouter} from "./routers/auth-router";
import {commentsRouter} from "./routers/comments-router";
import cookieParser from "cookie-parser";
import {devicesRouter} from "./routers/devices-router";




// create express app
export const app = express()

app.use(express.json())
app.use(cookieParser())
app.set('trust proxy', true)


app.get('/', (req: Request, res: Response ) => {
    let helloMessage = 'Hello Samurai!'
    res.send(helloMessage)
})

app.use('/', blogsRouter)
app.use('/', deleteAllRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/posts', postsRouter)
app.use('/comments', commentsRouter)
app.use('/security', devicesRouter )








export const settings = {
    JWT_SECRET: process.env.JWT_SECRET || "123"
}