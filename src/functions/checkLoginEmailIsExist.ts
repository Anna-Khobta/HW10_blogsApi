
import {usersRepository} from "../repositories/users-db-repositories";

export const checkEmailExist = async (email: string) => {

    const user = await usersRepository.checkUserByEmail(email);

    if (user) {
        return Promise.reject("User with that email already exists");
    }

};

export const checkEmailInbase = async (email: string) => {

    const user = await usersRepository.checkUserByEmail(email);

    if (!user) {
        return Promise.reject("This email wasn't registration in our app");
    }

};

export const checkLoginExist = async (login: string) => {

    const user = await usersRepository.checkUserByLogin(login);

    if (user) {
        return Promise.reject("User with that login already exists");
    }

};


export const checkCodeInbase = async (code: string) => {

    const user = await usersRepository.checkUserByCode(code);

    if (!user) {
        return Promise.reject("This code wasn't registration in our app");
    }

};
