import {usersRepository} from "../repositories/users-db-repositories";
import {UserTypeWiithoutIds, UserViewType} from "../repositories/db/types";
import {v4 as uuidv4} from "uuid";
import {UserModelClass} from "../repositories/db/db";
import {usersQueryRepositories} from "../repositories/users-query-repositories";

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(5);


export const usersService= {

    async createUser(login:string, email:string, password: string, isConfirmed: boolean): Promise <string | null> {

        const hashPassword = await bcrypt.hash(password, salt)

        let newUser: UserTypeWiithoutIds = {
            accountData: {
                login: login,
                email: email,
                hashPassword: hashPassword,
                createdAt: (new Date()).toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: new Date(),
                isConfirmed: isConfirmed
            },
            passwordRecovery: {
                recoveryCode: null,
                exp: null
            }
        }

        const userInstance = new UserModelClass(newUser)
        await usersRepository.save(userInstance)

        return userInstance._id.toString()

    },

    async checkPasswordCorrect(passwordHash:string, password: string): Promise <boolean> {

        return await bcrypt.compare(password, passwordHash)

    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    },

    async deleteAllUsers(): Promise<number> {
        return usersRepository.deleteAllUsers()

    },

    async findUserById(userId:string): Promise<UserViewType | null> {
        return await usersQueryRepositories.findUserById(userId)
    }

}