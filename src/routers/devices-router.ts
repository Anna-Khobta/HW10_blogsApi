import {Request, Response, Router} from "express";

import {tokenRepositories} from "../repositories/token-db-repositories";
import {refreshTokenMiddleware} from "../middlewares/RefreshToken-Middleware";
import {devicesService} from "../domain/devices-service";

export const devicesRouter = Router({})

devicesRouter
    .get("/devices",
        refreshTokenMiddleware,
        async (req:Request, res: Response) => {

            const refreshToken = req.cookies['refreshToken']

            const findDevicesForUser = await tokenRepositories.findAllDevices(refreshToken)

            return res.status(200).send(findDevicesForUser)

    })

.delete('/devices/:deviceId',
    refreshTokenMiddleware,
    async (req: Request, res: Response) => {

    const refreshToken = req.cookies['refreshToken']

        //console.log(refreshToken)

    const foundUserByDeviceId = await tokenRepositories.findUserByDeviceId(req.params.deviceId)

        console.log(foundUserByDeviceId)

        if (!foundUserByDeviceId) {
            return res.sendStatus(404) // not found
        }

        if (!(foundUserByDeviceId === refreshToken.userId)) {
           return res.status(403).send("try to delete the deviceId of other user")
        }

    const isDeleted = await devicesService.deleteDevice(req.params.deviceId)

        console.log(isDeleted)

        if (!isDeleted) {
            return res.sendStatus(404)
        } else {
            return res.sendStatus(204)
        }
})

    // Terminate all other (exclude current) device's sessions
.delete("/devices",
    refreshTokenMiddleware,
    async (req: Request, res: Response) => {

        const refreshToken = req.cookies['refreshToken']

        const isTerminateAllSessionsExcludeCurrent = await devicesService.deleteAllExcludeOne(refreshToken.deviceId)

        if (!isTerminateAllSessionsExcludeCurrent) {
            return res.status(404).send("Something wrong with db")
        } else {
            return res.sendStatus(204)
        }


    })