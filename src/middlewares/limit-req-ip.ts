import {NextFunction, Request, Response} from "express";
import {ipDbRepositories} from "../repositories/ip-db-repositories";
import {ipDbType} from "../repositories/types";

/*const checkLimits = (ip: string, enpoint: string): boolean => {
    //check...
    return true
}*/

export const limitIpMiddleware = async (req: Request, res:Response, next:NextFunction) => {

/*const isLimitCorrect = checkLimits(req.ip, req.originalUrl)
    //..*/

    const receivedIp: ipDbType = {
        ip: req.ip,
        iat: new Date(),
        endpoint: req.originalUrl
    }

    await ipDbRepositories.addIp(receivedIp)

    const foundMatchesIp = await ipDbRepositories.findLast10sIp(receivedIp)

    if (foundMatchesIp.length > 5) {
        return res.sendStatus(429)
    } else {
            next()
        }
}