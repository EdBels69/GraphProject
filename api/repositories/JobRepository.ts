
import { BaseRepository } from './BaseRepository'
import { ResearchJob } from '../../shared/contracts/research'
import { ResearchJobRecord } from '../core/Database'
import { v4 as uuidv4 } from 'uuid'
import { articleRepository } from './ArticleRepository'

export class JobRepository extends BaseRepository {

    async saveWithArticles(job: ResearchJob): Promise<void> {
        const jobData = {
            id: job.id,
            userId: job.userId,
            topic: job.topic,
            mode: job.mode,
            status: job.status,
            progress: job.progress,
            error: job.error,
            queries: JSON.stringify(job.queries || []),
            articlesFound: job.articlesFound || 0,
            articlesProcessed: job.articlesProcessed || 0,
            updatedAt: new Date(),
            includedIds: JSON.stringify(job.includedIds || []),
            excludedIds: JSON.stringify(job.excludedIds || []),
            exclusionReasons: JSON.stringify(job.exclusionReasons || {}),
            reviewText: job.reviewText,
            graphId: job.graphId
        }

        const jobUpsert = this.prisma.researchJob.upsert({
            where: { id: job.id } as any,
            update: jobData as any,
            create: {
                ...jobData,
                createdAt: job.createdAt ? new Date(job.createdAt) : new Date()
            } as any
        })

        const articleOps = job.articles && job.articles.length > 0
            ? articleRepository.getUpsertOperations(job.id, job.userId, job.articles)
            : []

        await this.prisma.$transaction([jobUpsert, ...articleOps])
    }

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

    async findAllActive(): Promise<ResearchJobRecord[]> {
        return await this.prisma.researchJob.findMany({
            where: {
                status: {
                    in: ['pending', 'searching', 'downloading', 'analyzing']
                }
            } as any,
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
