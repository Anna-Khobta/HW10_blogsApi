import {UserType} from "../repositories/db/types";

declare global{
    declare namespace Express {
        export interface Request {
            user: UserType | null
        }
    }
}