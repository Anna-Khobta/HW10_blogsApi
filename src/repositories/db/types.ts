import {ObjectId} from "mongodb";


export type BlogType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean
}

export type BlogsWithPagination = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogType[]
}


export type PostViewType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,

}

export type PostTypeWithoutIds = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
}

export type PostsWithPagination = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostViewType[]
}

export type PostDbType = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
}


export type CommentDBType = {
    id: string,
    postId: string
    content: string,
    createdAt: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    likesInfo: {
        likesCount: number | 0,
        usersPutLikes: UserLikeInfo[],
    },
    dislikesInfo: {
        dislikesCount: number | 0
        usersPutDislikes: UserLikeInfo[],
    }

}


export type UserLikeInfo = {
    userId: string,
    createdAt: string
}

export enum LikeStatusesEnum  {
    Like = "Like",
    Dislike = "Dislike",
    None = "None"
}

export type LikeStatusType = "Like" | "Dislike" | "None"


export type CommentViewType = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    createdAt: string,
    likesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: LikeStatusType
    }
}




export type UserViewType = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}

export type UsersWithPagination = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserViewType[]
}

export type UserDbType = {
    //id: string,
    accountData: {
        login: string,
        email: string,
        hashPassword: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    },
    passwordRecovery: {
        recoveryCode: string | null,
        exp: Date | null

    }
}

export type UserWithMongoId = UserDbType & { _id: ObjectId; }

export type UserTypeWiithoutIds = {
    accountData: {
        login: string,
        email: string,
        hashPassword: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    },
    passwordRecovery: {
        recoveryCode: string | null,
        exp: Date | null

    }
}

export type UserInfoForEmail = {
    id: string,
    email: string,
    confirmationCode: string
}


export type TokenDBType = {
    iat: number,
    exp: number,
    deviceId: string,
    deviceTitle: string,
    ip: string,
    userId: string
}

export type ipDbType = {
    ip: string,
    iat: Date,
    endpoint: string
}

export type deviceViewType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}


