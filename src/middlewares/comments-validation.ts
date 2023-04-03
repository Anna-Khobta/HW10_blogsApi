import {body} from "express-validator";

export const contentCommentValidation = body('content')
    .trim().not().isEmpty().withMessage("The content is empty")
    .isLength({min:20, max:300}).withMessage("The min length is 20. The maximum length is 300")