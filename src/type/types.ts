
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


export type PostType = {
    id: string,
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
    items: PostType[]
}

export type CommentDBType = {
    id: string,
    postId: string
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    createdAt: string
}

export type CommentViewType = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    createdAt: string
}

export type UserViewWhenAdd = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}

export type UserDbType = {
    id: string,
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


