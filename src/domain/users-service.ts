
import {usersRepository} from "../repositories/users-db-repositories";
import {UserTypeWiithoutIds} from "../type/types";
import {v4 as uuidv4} from "uuid";
import {UserModelClass} from "../repositories/db";

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(5);


export const usersService= {

    async createUser(login:string, email:string, password: string): Promise <string | null> {

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
                isConfirmed: true
            },
            passwordRecovery: {
                recoveryCode: null,
                exp: null
            }
        }

        const userInstance = new UserModelClass(newUser)
        await usersRepository.save(userInstance)

        const createdUserId = userInstance._id.toString()
        return createdUserId

    },

    async checkPasswordCorrect(passwordHash:string, password: string): Promise <boolean> {

        const validPassword: boolean = await bcrypt.compare(password, passwordHash)

        return validPassword

    },

    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
    },

    async deleteAllUsers(): Promise<number> {
        return usersRepository.deleteAllUsers()

    },

    async findUserById(userId:string) {
        return await usersRepository.findUserById(userId)
    }

}