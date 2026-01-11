
import { BaseRepository } from './BaseRepository'
import { ResearchJob } from '../../shared/contracts/research'
import { ResearchJobRecord } from '../core/Database'
import { v4 as uuidv4 } from 'uuid'

export class JobRepository extends BaseRepository {

    async create(job: ResearchJob): Promise<ResearchJobRecord> {
        return await this.prisma.researchJob.create({
            data: {
                id: job.id,
                topic: job.topic,
                mode: job.mode,
                status: job.status,
                articlesFound: job.articlesFound || 0,
                progress: job.progress,
                userId: job.userId,
                queries: JSON.stringify(job.queries || []),
                // Default values for required fields
                createdAt: new Date(),
                updatedAt: new Date(),
                articles: [], // Initially empty
            } as any
        }) as unknown as ResearchJobRecord
    }

    async update(id: string, data: Partial<ResearchJobRecord>): Promise<ResearchJobRecord> {
        return await this.prisma.researchJob.update({
            where: { id } as any,
            data: data as any
        }) as unknown as ResearchJobRecord
    }

    async findById(id: string): Promise<ResearchJobRecord | null> {
        return await this.prisma.researchJob.findUnique({
            where: { id } as any
        }) as unknown as ResearchJobRecord | null
    }

    async findAllByUserId(userId: string): Promise<ResearchJobRecord[]> {
        return await this.prisma.researchJob.findMany({
            where: { userId } as any,
            orderBy: { createdAt: 'desc' }
        }) as unknown as ResearchJobRecord[]
    }

    async delete(id: string): Promise<ResearchJobRecord> {
        return await this.prisma.researchJob.delete({
            where: { id } as any
        }) as unknown as ResearchJobRecord
    }
}

export const jobRepository = new JobRepository()
