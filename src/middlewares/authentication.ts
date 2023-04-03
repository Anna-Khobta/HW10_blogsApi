import {body} from "express-validator";
import {checkCodeInbase, checkEmailExist, checkEmailInbase, checkLoginExist} from "../functions/checkLoginEmailIsExist";

export const loginValidation = body("login")
    .trim().not().isEmpty().withMessage("The login is empty")
    .isLength({min:3, max:10}).withMessage("The length should be minimum 3, maximum 10")
    .matches(/^[a-zA-Z0-9_-]*$/)
    .custom( (value)=> { return checkLoginExist(value)})

export const passwordValidation = body("password")
    .trim().not().isEmpty().withMessage("The password is empty")
    .isLength({min:6, max: 20}).withMessage("The length should be minimum 6, maximum 20")

export const emailValidation = body("email")
    .trim().not().isEmpty().withMessage("The email is empty")
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .custom( (value)=> { return checkEmailExist(value)})

// .isEmail()

export const loginOrEmailValidation = body("loginOrEmail")
    .trim().not().isEmpty().withMessage("The loginOrEmail is empty")
    .isLength({min:3, max:50}).withMessage("Error in length")


export const emailValidationSimple = body("email")
    .trim().not().isEmpty().withMessage("The email is empty")
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)


export const checkUserEmailInbase = body("email")
    .custom( (value)=> { return checkEmailInbase(value)})

export const checkCodeInDb= body("code")
    .custom( (value)=> { return checkCodeInbase(value)})


