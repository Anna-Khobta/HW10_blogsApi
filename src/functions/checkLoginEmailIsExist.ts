
import {usersQueryRepositories} from "../repositories/users-query-repositories";

export const checkEmailExist = async (email: string) => {

    const user = await usersQueryRepositories.findUserByLoginOrEmail(null, email);

    if (user) {
        return Promise.reject("User with that email already exists");
    }

};

export const checkEmailInbase = async (email: string) => {

    const user = await usersQueryRepositories.findUserByLoginOrEmail(null, email);

    if (!user) {
        return Promise.reject("This email wasn't registration in our app");
    }

};

export const checkLoginExist = async (login: string) => {

    const user = await usersQueryRepositories.findUserByLoginOrEmail(login, null);

    if (user) {
        return Promise.reject("User with that login already exists");
    }

};


export const checkCodeInbase = async (code: string) => {

    const user = await usersQueryRepositories.findUserByCode(code);

    if (!user) {
        return Promise.reject("This code wasn't registration in our app");
    }

};

export const checkRecoveryCodeInBase = async (recoveryCode: string) => {

    const user = await usersQueryRepositories.findUserByRecoveryCode(recoveryCode);

    if (!user || user.passwordRecovery.exp! < new Date()) {
        return Promise.reject("Incorrect Recovery Code");
    }
};
