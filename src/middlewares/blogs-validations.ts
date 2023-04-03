import {body} from "express-validator";

export const nameValidation = body('name')
    .trim().not().isEmpty().withMessage("The name is empty")
    .isLength({max:15}).withMessage("The maximum length  is 15")

export const descriptionValidation = body('description')
    .trim().not().isEmpty().withMessage("The description is empty")
    .isLength({max:500}).withMessage("The maximum length is 500")

export const websiteUrlValidation = body('websiteUrl')
    .isLength({max:100}).withMessage("The maximum length is 100")
    .isURL().withMessage("A URL is badly formed or contains invalid characters")