import {UserDbType, UsersWithPagination, UserViewType} from "../type/types";
import {PostModelClass, UserModelClass} from "./db";
import {SortOrder} from "mongoose";

export const usersQueryRepositories = {

    async findUserByLoginOrEmail(login: string, email: string): Promise<UserDbType | null | boolean> {

        let foundUser = await UserModelClass.findOne({$or: [{"accountData.login": login}, {"accountData.email": email}]}).lean()

        return foundUser;

    },

    async findUserById(createdId: string): Promise<UserViewType | null> {

        const user = await UserModelClass.findById(createdId).lean()

        if (!user) { return null }

        const userView = {
            id: user._id.toString(),
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }

        return userView
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

    async checkUserByEmail(email: string): Promise<UserDbType | null> {

        let foundUser = await PostModelClass.findOne({"accountData.email": email})

        if (foundUser) {
            return foundUser
        } else {
            return null
        }

    },
}