import {deviceViewType, TokenDBType} from "../type/types";
import {tokensCollection} from "./db";


export const tokenRepositories = {

    async addToken(newRefTokenDb: TokenDBType): Promise<boolean> {

        const insertNewTokenToDb = await tokensCollection.insertOne(newRefTokenDb)

        return insertNewTokenToDb.acknowledged
    },

    async findToken(decodedRefreshToken: any): Promise<TokenDBType | null> {

        const foundTokenInDb = await tokensCollection.findOne(
            {
                userId: decodedRefreshToken.userId,
                iat: decodedRefreshToken.iat
            }, {projection: {_id: 0}})

        if (!foundTokenInDb) {
            return null
        } else {
            return foundTokenInDb
        }
    },


    async findAllDevices(findTokenInDb: TokenDBType): Promise<deviceViewType[]> {

        const foundAllTokensInDb = await tokensCollection.find(
            {userId: findTokenInDb.userId},
            {
                projection: {
                    _id: 0,
                    ip: 1,
                    deviceTitle: 1,
                    iat: 1,
                    deviceId: 1
                }
            })
            .toArray()


        const items: deviceViewType[] = foundAllTokensInDb.map(tokensInfo => ({
            ip: tokensInfo.ip,
            title: tokensInfo.deviceTitle,
            lastActiveDate: new Date(tokensInfo.iat * 1000).toISOString(),
            deviceId: tokensInfo.deviceId
        }))

        return items

    },

    async findUserByDeviceId(deviceId: string): Promise<string | null> {

        const foundTokenInDb = await tokensCollection.findOne(
            {deviceId: deviceId}, {projection: {_id: 0}})

        if (foundTokenInDb) {
            return foundTokenInDb.userId
        } else {
            return null
        }
    },


    async updateToken(decodedRefreshToken: any, ip: string): Promise<boolean> {

        const result = await tokensCollection.updateOne({
                userId: decodedRefreshToken.userId,
                deviceId: decodedRefreshToken.deviceId
            },
            {
                $set: {
                    iat: decodedRefreshToken.iat,
                    exp: decodedRefreshToken.exp,
                    ip: ip
                }
            })
        return result.matchedCount === 1

    },


    async updateTokenIatExpIp(refreshToken: TokenDBType): Promise<boolean> {

        const result = await tokensCollection.updateOne(
            {
                userId: refreshToken.userId,
                deviceId: refreshToken.deviceId,
                deviceTitle: refreshToken.deviceTitle
            },
            {
                $set: {
                    iat: refreshToken.iat,
                    exp: refreshToken.exp,
                    ip: refreshToken.ip
                }
            })
        return result.matchedCount === 1

    },

    async deleteToken(foundTokenInDb: TokenDBType): Promise<boolean> {

        const result = await tokensCollection.deleteOne({
            userId: foundTokenInDb.userId,
            deviceId: foundTokenInDb.deviceId,
            iat: foundTokenInDb.iat
        })

        return result.deletedCount === 1

    },


    async deleteDevice(id: string): Promise<boolean> {

        const result = await tokensCollection.deleteOne({deviceId: id})
        return result.deletedCount === 1
    },

    async deleteAllExcludeOne(deviceId: string): Promise<boolean> {

        const result = await tokensCollection.deleteMany({deviceId: {$ne: deviceId}})

        return result.acknowledged

    },

    async deleteAllTokens(): Promise<boolean> {
        const result = await tokensCollection.deleteMany({})
        return result.acknowledged
        // если всё удалит, вернет true

    }
}
