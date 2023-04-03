import {ipDbType} from "./types";
import {ipCollection} from "./db";


export const ipDbRepositories = {

    async addIp(receivedIp: ipDbType): Promise<Boolean> {

        try {
            const insertNewIpToDb = await ipCollection.insertOne(receivedIp)
            return insertNewIpToDb.acknowledged

        } catch (error) {
            console.log(error)
            return false
        }
    },

    async findLast10sIp (receivedIp: ipDbType): Promise <ipDbType[]> {

        const limitTime = new Date(Date.now() - 10 * 1000);

        //const filter: any = {ip: receivedIp.ip, iat: { $gte: limitTime }}

        const foundIpInDb  = await ipCollection
            .find({ip: receivedIp.ip, endpoint: receivedIp.endpoint, iat: { $gte: limitTime }},{projection:{_id:0}})
            .toArray()

        //console.log(foundIpInDb)

        return foundIpInDb

    }
}