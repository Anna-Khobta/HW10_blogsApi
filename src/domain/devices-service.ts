

// где это должно собираться из 2х коллекций?

import {tokenRepositories} from "../repositories/token-db-repositories";


export const devicesService = {

    async deleteDevice (id: string): Promise<boolean> {

        return await tokenRepositories.deleteDevice(id)
    },

    async deleteAllExcludeOne (deviceId: string): Promise<boolean> {

        return await tokenRepositories.deleteAllExcludeOne(deviceId)
    }
}