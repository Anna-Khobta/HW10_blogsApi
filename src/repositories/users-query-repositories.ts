import {UserDbType, UserInfoForEmail, UsersWithPagination, UserViewType, UserWithMongoId} from "../type/types";
import {PostModelClass, UserModelClass} from "./db";
import {SortOrder} from "mongoose";

export const usersQueryRepositories = {

    async findUserByLoginOrEmail(login: string | null, email: string | null): Promise<UserWithMongoId | null> {

        let foundUser = await UserModelClass.findOne({$or: [{"accountData.login": login}, {"accountData.email": email}]}).lean()

        return foundUser;

    },

    async findUserById(userId: string): Promise<UserViewType | null> {

        const user = await UserModelClass.findById(userId).lean()

        if (!user) { return null }

        const userView = {
            id: user._id.toString(),
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }

        return userView
    },

    async findUserByCode(code: string): Promise<UserDbType | null> {

        let foundUser = await UserModelClass.findOne({"emailConfirmation.confirmationCode": code}).lean()

        if (! foundUser) {
            return null
        } else {
            return foundUser
        }
    },

    async findUserByRecoveryCode(recoveryCode: string): Promise<UserWithMongoId | null> {

        let foundUser = await UserModelClass.findOne({"passwordRecovery.recoveryCode": recoveryCode}).lean()

        if (! foundUser) {
            return null
        } else {
            return foundUser
        }
    },

    async findUsers(page: number, limit: number,
                    sortDirection: SortOrder, sortBy: string,
                    searchLoginTerm: string, searchEmailTerm: string,
                    skip: number): Promise<UsersWithPagination> {

        const filter = {
            $or: [{"accountData.login": {$regex: searchLoginTerm, $options: 'i'}},
                {"accountData.email": {$regex: searchEmailTerm, $options: 'i'}}]
        }

        let findUsers = await UserModelClass
            .find(filter,
                {__v: 0})
            .skip(skip)
            .limit(limit)
            .sort({sortBy: sortDirection})
            .lean()

        const items: UserViewType[] = findUsers.map(user => ({
            id: user._id.toString(),
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }));

        const total = await PostModelClass.countDocuments(filter)
        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: items
        }
    },

    async findUserInfoForEmailSend(userId: string): Promise< UserInfoForEmail | null> {

        const user = await UserModelClass.findById(userId).lean()

        if (!user) { return null }

        return {
            id: user._id.toString(),
            email: user.accountData.email,
            confirmationCode: user.emailConfirmation.confirmationCode
        }
    },

    async findUserByConfirmationCode(code: string): Promise<UserWithMongoId | null> {

        let foundUser = await UserModelClass.findOne(
            {"emailConfirmation.confirmationCode": code},
            {__v: 0})

        return foundUser || null
    },
}