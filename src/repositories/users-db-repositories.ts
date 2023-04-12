import {UserModelClass} from "./db";
import {UserDbType} from "../type/types";
import {HydratedDocument} from "mongoose";


const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(5);

export const usersRepository = {

    async save(userInstance: HydratedDocument<UserDbType>): Promise<boolean> {
        try {
            await userInstance.save()
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },


    async deleteUser(id: string): Promise<boolean> {
        const userInstance = await UserModelClass.findOne({_id: id})
        if (!userInstance) return false

        await userInstance.deleteOne()
        return true

    },

    async deleteAllUsers(): Promise<number> {
        const result = await UserModelClass.deleteMany({})
        return result.deletedCount
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

    async findUserByRecoveryCode(recoveryCode: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne({"passwordRecovery.recoveryCode": recoveryCode}, {projection: {_id: 0, password: 0,}})

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

    async updateConfirmation(id: string): Promise<boolean> {
        let result = await usersCollection.updateOne({id: id}, {$set: {"emailConfirmation.isConfirmed": true}})
        return result.modifiedCount === 1
    },

    async findUserByEmail(email: string): Promise<UserDbType | null> {

        let foundUser = await usersCollection.findOne(
            {"accountData.email": email},
            {projection: {_id: 0}})

        return foundUser || null
    },

    async updateConfirmationCode(id: string, generateConfirmationCode: string, generateExpirationDate: Date): Promise<boolean> {
        let result = await usersCollection.updateOne({id: id},
            {
                $set: {
                    "emailConfirmation.confirmationCode": generateConfirmationCode,
                    "emailConfirmation.expirationDate": generateExpirationDate
                }
            })
        return result.modifiedCount === 1
    },

    async updatePasswordRecoveryCode(id: string, generatePassRecovCode: string, generatePassRecovCodeExpirationDate: Date): Promise<boolean> {
        let result = await usersCollection.updateOne({id: id},
            {
                $set: {
                    "passwordRecovery.recoveryCode": generatePassRecovCode,
                    "passwordRecovery.exp": generatePassRecovCodeExpirationDate
                }
            })
        return result.modifiedCount === 1
    },

    async updatePassword (id: string, newPassword: string): Promise<boolean> {

        const hashPassword = await bcrypt.hash(newPassword, salt)

        // password hash
        let result = await usersCollection.updateOne({id: id},
            {
                $set: {
                    "accountData.hashPassword": hashPassword,
                    "passwordRecovery.recoveryCode": null,
                    "passwordRecovery.exp": null
                }
            })
        return result.modifiedCount === 1
    }
}



/*    async createUser(newUser: UserDbType): Promise<UserViewWhenAdd | null> {

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
    }*/

/* async findUsers(page: number,
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

     const findUsers = await usersCollection.find
     (filter,
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
 },*/