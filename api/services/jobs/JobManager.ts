import { ResearchJob, ResearchJobRequest, ResearchJobStatus } from '../../../shared/contracts/research'
import { logger } from '../../core/Logger'
import { jobLogger } from '../jobLogger'
import { jobRepository } from '../../repositories/JobRepository'
import { articleRepository } from '../../repositories/ArticleRepository'
import { socketService } from '../SocketService'
import fs from 'fs'
import path from 'path'

export class JobManager {
    private jobs: Map<string, ResearchJob> = new Map()

    /**
     * Initialize - load jobs from DB
     */
    async initialize(): Promise<void> {
        await this.syncJobsWithDb().catch(err => {
            logger.error('JobManager', 'Failed initial job sync', { err })
        })
    }

    /**
     * Sync jobs from database to memory
     */
    private async syncJobsWithDb(): Promise<void> {
        try {
            // Loading jobs for local admin for now, mirroring original behavior
            const adminJobs = await jobRepository.findAllByUserId('local-admin')
            adminJobs.forEach(record => {
                // Map record to ResearchJob - simplified mapping, real app might need more
                const job: ResearchJob = {
                    id: record.id,
                    userId: record.userId,
                    topic: record.topic,
                    mode: (record.mode as any) || 'research',
                    status: record.status as any,
                    progress: record.progress,
                    queries: typeof record.queries === 'string' ? JSON.parse(record.queries) : (record.queries || []),
                    articlesFound: record.articlesFound,
                    articlesProcessed: record.articlesProcessed || 0,
                    createdAt: record.createdAt.toISOString(),
                    updatedAt: record.updatedAt.toISOString(),
                    graphId: record.graphId,
                    error: record.error
                }
                this.jobs.set(job.id, job)
            })
            logger.info('JobManager', `Synced ${adminJobs.length} jobs from DB`)
        } catch (e) {
            logger.error('JobManager', 'Job synchronization failed', { error: e })
        }
    }

    /**
     * Create and register a new job
     */
    createJob(request: ResearchJobRequest, userId: string): ResearchJob {
        const jobId = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const job: ResearchJob = {
            id: jobId,
            userId: userId,
            topic: request.topic,
            mode: request.mode || 'research',
            status: 'pending',
            progress: 0,
            queries: [],
            articlesFound: 0,
            articlesProcessed: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        this.jobs.set(jobId, job)
        this.log(jobId, 'info', `Job created for topic: "${job.topic}"`)

        // Initial persist
        this.persistJob(job).catch(e => logger.error('JobManager', 'Failed to persist new job', { error: e }))

        return job
    }

    getJob(jobId: string): ResearchJob | undefined {
        return this.jobs.get(jobId)
    }

    getAllJobs(userId: string): ResearchJob[] {
        return Array.from(this.jobs.values()).filter(j => j.userId === userId)
    }

    async updateJobStatus(jobId: string, status: ResearchJobStatus, error?: string): Promise<void> {
        const job = this.jobs.get(jobId)
        if (!job) return

        job.status = status
        if (error) job.error = error
        job.updatedAt = new Date().toISOString()

        await this.persistJob(job)
        this.log(jobId, error ? 'error' : 'info', `Status updated to: ${status} ${error ? `(Error: ${error})` : ''}`)

        // Emit Socket Event
        socketService.emitJobProgress(jobId, job.progress, undefined, status)
    }

    async updateProgress(jobId: string, progress: number, message?: string): Promise<void> {
        const job = this.jobs.get(jobId)
        if (!job) return

        job.progress = progress
        job.updatedAt = new Date().toISOString()

        await this.persistJob(job)
        if (message) this.log(jobId, 'info', message)

        // Emit Socket Event
        socketService.emitJobProgress(jobId, progress, message, job.status)
    }

    async persistJob(job: ResearchJob): Promise<void> {
        try {
            // Check if exists using findById logic or create/update separation could be better
            // Ideally repository handles upsert, or we check first.
            // For now, let's use a simpler approach if possible or assume upsert logic in repository
            // But Prisma's upsert needs id.

            // Actually, we can just try to update, if fails, create? 
            // Or better: JobRepository.save() method that handles upsert.
            // But since I implemented create/update/findById separately:

            // Checking existence is costly if we do it every time.
            // But JobManager holds memory state, so we know if it's new (via this.jobs.has() logic in createJob) theoretically.
            // But createJob already adds it to map.

            // Let's rely on standard upsert if I add it, or check for now.
            // However, jobRepository.update throws if ID not found usually? Or returns null?
            // Prisma update throws.

            // Let's implement upsert in repository or check here.
            // Checking here:
            const exists = await jobRepository.findById(job.id)
            if (exists) {
                await jobRepository.update(job.id, {
                    status: job.status,
                    progress: job.progress,
                    articlesFound: job.articlesFound,
                    queries: JSON.stringify(job.queries),
                    updatedAt: new Date(),
                    error: job.error,
                    graphId: job.graphId
                })
            } else {
                await jobRepository.create(job)
            }

            if (job.articles && job.articles.length > 0) {
                await articleRepository.saveJobArticles(job.id, job.userId, job.articles)
            }

        } catch (e) {
            logger.warn('JobManager', `Failed to persist job ${job.id}`, { error: e })
        }
    }

    async deleteJob(jobId: string, userId: string): Promise<boolean> {
        const job = this.jobs.get(jobId)
        if (job && job.userId !== userId) return false

        // 1. Cancel logic
        const activeStatuses: ResearchJobStatus[] = ['searching', 'downloading', 'analyzing']
        // @ts-ignore
        if (job && activeStatuses.includes(job.status)) {
            // We just mark it cancelled logic here, effective cancellation happens in agents checking status
            job.status = 'cancelled'
            await this.persistJob(job)
        }

        // 2. DB Delete
        const deletedRecord = await jobRepository.delete(jobId)
        const deleted = !!deletedRecord
        if (!deleted && !job) return false

        // 3. File Cleanup
        try {
            const jobDir = path.join(process.cwd(), 'downloads', jobId)
            if (fs.existsSync(jobDir)) {
                fs.rmSync(jobDir, { recursive: true, force: true })
            }
        } catch (e) {
            logger.warn('JobManager', `Failed to delete files for job ${jobId}`, { error: e })
        }

        // 4. Memory Cleanup
        this.jobs.delete(jobId)
        return true
    }

    log(jobId: string, type: 'info' | 'search' | 'ai' | 'error' | 'success', message: string): void {
        jobLogger.log(jobId, type, message)
    }
}

export const jobManager = new JobManager()
