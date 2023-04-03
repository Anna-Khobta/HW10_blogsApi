import {body} from "express-validator";

export const titleValidation = body('title')
    .trim().not().isEmpty().withMessage("The title is empty")
    .isLength({max:30}).withMessage("The maximum length is 30")

export const shortDescriptionValidation = body('shortDescription')
    .trim().not().isEmpty().withMessage("The description is empty")
    .isLength({max:100}).withMessage("The maximum length is 100")

export const contentValidation = body('content')
    .trim().not().isEmpty().withMessage("The content is empty")
    .isLength({max:1000}).withMessage("The maximum length is 1000")

export const idValidation = body('blogId')
    .trim().not().isEmpty().withMessage("The blogId is empty")
    .isLength({max:18}).withMessage("The maximum length is 18")


/*
export const idContainsValidation = body('blogId')
    .custom((value, {req}) => {
        let findBlogID = blogs.find(p => p.id === +(req.body.blogId) )
        if (!findBlogID) {
            throw new Error("Error with blogID")
        }
        // Indicates the success of this synchronous custom validator
        return true;
    })
*/
