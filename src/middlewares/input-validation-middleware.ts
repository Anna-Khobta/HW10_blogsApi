import {Request, Response, NextFunction} from "express";

import { validationResult, ValidationError } from 'express-validator';


export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errorFormatter = ({ msg, param }: ValidationError) => {
    // Build resulting errors
    return {message: msg, field: param};
    };

    const errors = validationResult(req).formatWith(errorFormatter)

    if (!errors.isEmpty()) {
        res.status(400).json({ errorsMessages: errors.array({onlyFirstError:true})})
    } else {
        next()
    }
}