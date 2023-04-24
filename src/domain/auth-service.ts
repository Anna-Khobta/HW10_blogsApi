import {usersRepository} from "../repositories/users-db-repositories";
import {v4 as uuidv4} from 'uuid';
import add from 'date-fns/add'
import {emailsManager} from "../managers/emails-manager";
import {usersQueryRepositories} from "../repositories/users-query-repositories";

const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(5);


export const authService= {

    async confirmEmail(code: string): Promise<boolean> {
        let foundUserByCode = await usersQueryRepositories.findUserByConfirmationCode(code)

        if (!foundUserByCode) return false

        if (foundUserByCode.emailConfirmation.confirmationCode === code && foundUserByCode.emailConfirmation.expirationDate > new Date()) {
            await usersRepository.updateConfirmation(foundUserByCode._id.toString())
            return true
        }
        return false
    },

    async checkEmailPassRecov (email: string): Promise<boolean> {
        let foundUserByEmail = await usersQueryRepositories.findUserByLoginOrEmail(null, email)

        if (!foundUserByEmail) return true

        const generatePassRecovCode = uuidv4()
        const generatePassRecovCodeExpirationDate = add(new Date(), {
            hours: 1,
            minutes: 2
        })

        await usersRepository.updatePasswordRecoveryCode(foundUserByEmail._id.toString(), generatePassRecovCode, generatePassRecovCodeExpirationDate)

        try {
            await emailsManager.sendEmailPasswordRecovery(generatePassRecovCode, email)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },


    async updatePassword (newPassword: string, recoveryCode: string): Promise<string | null> {

        const foundUserByCode = await usersQueryRepositories.findUserByRecoveryCode(recoveryCode)

        if (!foundUserByCode) { return null }

        return await usersRepository.updatePassword(foundUserByCode._id.toString(), newPassword)

    },
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


/*    async createUser(login: string, email: string, password: string): Promise<SentMessageInfo | null> {

        const hashPassword = await bcrypt.hash(password, salt)

        const newUser: UserDbType = {
            accountData: {
                login: login,
                email: email,
                hashPassword: hashPassword,
                createdAt: (new Date()).toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 2
                }),
                isConfirmed: false
            },
            passwordRecovery: {
                recoveryCode: null,
                exp: null
            }
        }

        const newUserDbView = await usersRepository.createUserRegistrashion(newUser)

        const emailInfo = await emailsManager.sendEmailConfirmationMessage(newUserDbView!)

        return emailInfo

    },*/

/* async checkEmail(email: string): Promise<boolean> {
        let foundUserByEmail = await usersRepository.findUserByEmail(email)

        if (!foundUserByEmail) return false

        try {
            await emailsManager.resendEmailConfirmationMessage(foundUserByEmail)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },*/