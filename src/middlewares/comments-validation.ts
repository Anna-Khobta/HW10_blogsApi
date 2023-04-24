import {body} from "express-validator";
import {LikeStatusesEnum} from "../repositories/db/types";

export const contentCommentValidation = body('content')
    .trim().not().isEmpty().withMessage("The content is empty")
    .isLength({min:20, max:300}).withMessage("The min length is 20. The maximum length is 300")

export const likeStatusValidation = [
    body('likeStatus')
        .trim()
        .not().isEmpty().withMessage("The likeStatus is empty")
        .custom((value) => {
            if (Object.values(LikeStatusesEnum).includes(value)) {
                return true;
            }
            throw new Error('Invalid likeStatus value');
        }),
];