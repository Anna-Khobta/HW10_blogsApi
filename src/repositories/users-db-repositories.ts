import { usersCollection} from "./db";
import {SortDirection} from "mongodb";
import {UserDbType, UserViewWhenAdd} from "./types";

export const usersRepository = {

    async checkUser(login: string, email: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne({$or: [{"accountData.login": login}, {"accountData.email": email}]})

        if (foundUser) {
            return foundUser
        } else {
            return null
        }

    },

    async checkUserByEmail(email: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne({"accountData.email": email})

        if (foundUser) {
            return foundUser
        } else {
            return null
        }

    },

    async checkUserByLogin(login: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne({"accountData.login": login})

        if (foundUser) {
            return foundUser
        } else {
            return null
        }

    },

    async checkUserByCode(code: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne({"emailConfirmation.confirmationCode": code})

        if (foundUser) {
            return foundUser
        } else {
            return null
        }

    },


    async checkUserLoginOrEmail(loginOrEmail: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne({$or: [{"accountData.login": loginOrEmail}, {"accountData.email": loginOrEmail}]})

        if (foundUser) {
            return foundUser
        } else {
            return null
        }

    },

    async createUser(newUser: UserDbType): Promise<UserViewWhenAdd | null> {

        const insertNewUserInDb = await usersCollection.insertOne(newUser)

        const newUserWithoughtId = await usersCollection.findOne(
            {id: newUser.id}, {projection: {_id: 0, password: 0,}})

        const returnUserView = {
            id: newUserWithoughtId!.id,
            login: newUserWithoughtId!.accountData.login,
            email: newUserWithoughtId!.accountData.email,
            createdAt: newUserWithoughtId!.accountData.createdAt

        }
        return returnUserView
    },

    async findUsers(page: number,
                    limit: number,
                    sortDirection: SortDirection,
                    sortBy: string,
                    searchLoginTerm: string,
                    searchEmailTerm: string,
                    skip: number) {

        const filter = {
            $or: [{"accountData.login": {$regex: searchLoginTerm, $options: 'i'}},
                {"accountData.email": {$regex: searchEmailTerm, $options: 'i'}}]
        }

        const findUsers = await usersCollection.find(
            filter,
            {
                projection: {
                    _id: 0,
                    id: 1,
                    "accountData.login": 1,
                    "accountData.email": 1,
                    "accountData.createdAt": 1
                }
            })
            .sort({[sortBy]: sortDirection})
            .skip(skip)
            .limit(limit)
            .toArray()

        const items = findUsers.map(user => ({
            id: user.id,
            login: user.accountData.login,
            email: user.accountData.email,
            createdAt: user.accountData.createdAt
        }));

        const total = await usersCollection.countDocuments(filter)

        const pagesCount = Math.ceil(total / limit)

        return {
            pagesCount: pagesCount,
            page: page,
            pageSize: limit,
            totalCount: total,
            items: items
        }
    },

    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({id: id})
        return result.deletedCount === 1
    },

    async deleteAllUsers(): Promise<boolean> {
        const result = await usersCollection.deleteMany({})
        return result.acknowledged
    },

    async findUserById(userId: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne(
            {id: userId},
            {projection: {_id: 0, password: 0, createdAt: 0}})

        return foundUser || null
    },

    async createUserRegistrashion(newUser: UserDbType): Promise<UserDbType | null> {

        await usersCollection.insertOne(newUser)

        const newUserWithoughtId = await usersCollection.findOne(
            {id: newUser.id}, {projection: {_id: 0}})

        return newUserWithoughtId
    },

    async findUserByConfirmationCode(code: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne(
            {"emailConfirmation.confirmationCode": code},
            {projection: {_id: 0}})

        return foundUser || null
    },

    async updateConfirmation (id: string): Promise<boolean> {
        let result = await usersCollection.updateOne({id: id}, {$set: {"emailConfirmation.isConfirmed": true}})
        return result.modifiedCount === 1
    },

    async findUserByEmail(email: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne(
            {"accountData.email": email},
            {projection: {_id: 0}})

        return foundUser || null
    },

    async updateConfirmationCode (id: string, generateConfirmationCode:string, generateExpirationDate: Date): Promise<boolean> {
        let result = await usersCollection.updateOne({id: id},
            {$set: {
                "emailConfirmation.confirmationCode": generateConfirmationCode,
                    "emailConfirmation.expirationDate": generateExpirationDate}})
        return result.modifiedCount === 1
    }
}
