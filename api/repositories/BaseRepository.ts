
import { databaseManager } from '../core/Database'
import { PrismaClient } from '../core/prisma'

export abstract class BaseRepository {
    protected get prisma(): PrismaClient {
        return databaseManager.getClient()
    }
}
