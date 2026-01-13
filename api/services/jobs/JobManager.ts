import { ResearchJob, ResearchJobRequest, ResearchJobStatus } from '../../../shared/contracts/research'
import { logger } from '../../core/Logger'
import { jobLogger } from '../jobLogger'
import { jobRepository } from '../../repositories/JobRepository'
import { articleRepository } from '../../repositories/ArticleRepository'
import { socketService } from '../SocketService'
import fs from 'fs'
import path from 'path'

/**
 * Manages the lifecycle of Research Jobs.
 * Handles creation, status updates, persistence, and efficient in-memory tracking.
 */
export class JobManager {
    private jobs: Map<string, ResearchJob> = new Map()

    /**
     * Initialize JobManager by synchronizing with the persistent database.
     * Loads active jobs into memory for quick access.
     */
    async initialize(): Promise<void> {
        await this.syncJobsWithDb().catch(err => {
            logger.error('JobManager', 'Failed initial job sync', { err })
        })
    }

    /**
     * Internal sync mechanism to load jobs from SQLite via Repository.
     * Currently loads jobs for the default 'local-admin' user.
     */
    private async syncJobsWithDb(): Promise<void> {
        try {
            // Load ALL active jobs for restoration, regardless of user
            // This ensures background agents can continue processing
            const activeJobs = await jobRepository.findAllActive()

            activeJobs.forEach(record => {
                // Map record to ResearchJob - simplified mapping, real app might need more
                const job: ResearchJob = {
                    id: record.id,
                    userId: record.userId,
                    topic: record.topic,
                    mode: (record.mode as any) || 'research',
                    status: record.status as any,
                    progress: record.progress,
                    queries: typeof record.queries === 'string' ? JSON.parse(record.queries) : (record.queries || []) as string[],
                    articlesFound: record.articlesFound,
                    articlesProcessed: record.articlesProcessed || 0,
                    createdAt: record.createdAt.toISOString(),
                    updatedAt: record.updatedAt.toISOString(),
                    graphId: record.graphId,
                    error: record.error
                }
                this.jobs.set(job.id, job)
            })
            logger.info('JobManager', `Synced ${activeJobs.length} active jobs from DB`)
        } catch (e) {
            logger.error('JobManager', 'Job synchronization failed', { error: e })
        }
    }

    /**
     * Create a new Research Job.
     * 
     * @param request - The job creation request containing topic and mode
     * @param userId - The ID of the user requesting the job
     * @returns The newly created ResearchJob object
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

    /**
     * Retrieve a job by ID from memory.
     * 
     * @param jobId - Unique job identifier
     * @returns The ResearchJob if defined, otherwise undefined
     */
    getJob(jobId: string): ResearchJob | undefined {
        return this.jobs.get(jobId)
    }

    /**
     * Retrieve all jobs for a specific user.
     * 
     * @param userId - The user ID
     * @returns Array of ResearchJob objects
     */
    getAllJobs(userId: string): ResearchJob[] {
        return Array.from(this.jobs.values()).filter(j => j.userId === userId)
    }

    /**
     * Update the status of a job and notify clients via Socket.IO.
     * Persists the change to the database.
     * 
     * @param jobId - The job ID
     * @param status - New status string
     * @param error - Optional error message if status is 'failed'
     */
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

    /**
     * Update the numeric progress of a job and notify clients.
     * 
     * @param jobId - The job ID
     * @param progress - Progress percentage (0-100)
     * @param message - Optional log message
     */
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

    /**
     * Persist job state to Database using Transactional Repository.
     * Ensures both Job and its Articles are saved atomically.
     * 
     * @param job - The ResearchJob to save
     */
    async persistJob(job: ResearchJob): Promise<void> {
        try {
            await jobRepository.saveWithArticles(job)
        } catch (e) {
            logger.warn('JobManager', `Failed to persist job ${job.id}`, { error: e })
        }
    }

    /**
     * Delete a job and clean up associated resources (Files, DB, Memory).
     * 
     * @param jobId - ID of the job to delete
     * @param userId - ID of the checking user
     * @returns True if deleted, false if not found or unauthorized
     */
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

    /**
     * Log a message to the job-specific log system.
     */
    log(jobId: string, type: 'info' | 'search' | 'ai' | 'error' | 'success' | 'warn', message: string): void {
        jobLogger.log(jobId, type, message)
    }
}

export const jobManager = new JobManager()
