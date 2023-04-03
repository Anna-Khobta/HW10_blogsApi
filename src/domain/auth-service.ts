
import {usersRepository} from "../repositories/users-db-repositories";
import {UserDbType} from "../repositories/types";

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(5);

import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add'
import {emailsManager} from "../managers/emails-manager";
import {SentMessageInfo} from "nodemailer";



export const authService= {

    async createUser(login: string, email: string, password: string): Promise<SentMessageInfo | null> {

        const hashPassword = await bcrypt.hash(password, salt)

        const newUser: UserDbType = {
            id: (+(new Date())).toString(),
            accountData: {
                login: login,
                email: email,
                password: hashPassword,
                createdAt: (new Date()).toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 2
                }),
                isConfirmed: false

            }
        }

        const newUserDbView = await usersRepository.createUserRegistrashion(newUser)

        const emailInfo = await emailsManager.sendEmailConfirmationMessage(newUserDbView!)

        return emailInfo

    },

    async confirmEmail(code: string): Promise<boolean> {
        let foundUserByCode = await usersRepository.findUserByConfirmationCode(code)

        if (!foundUserByCode) return false
        if (foundUserByCode.emailConfirmation.confirmationCode === code && foundUserByCode.emailConfirmation.expirationDate > new Date()) {
            return await usersRepository.updateConfirmation(foundUserByCode.id)

        }
        return false
    },

    async checkEmail(email: string): Promise<boolean> {
        let foundUserByEmail = await usersRepository.findUserByEmail(email)

        if (!foundUserByEmail) return false
        if (!foundUserByEmail.emailConfirmation.isConfirmed) {

            await emailsManager.resendEmailConfirmationMessage(foundUserByEmail!)

            return true
        }
        return false
    }
}


   /* async loginUser(foundUserInDb:UserType, loginOrEmail: string, password: string): Promise <boolean> {

        const validPassword: boolean = await bcrypt.compare(password, foundUserInDb.password)

        return validPassword

    },

    async deleteUser(id: string): Promise<boolean> {

        return await usersRepository.deleteUser(id)
    },

    async deleteAllUsers(): Promise<boolean> {
        return usersRepository.deleteAllUsers()

    },

    async findUserById(userId:string) {
        return await usersRepository.findUserById(userId)
    }



}*/