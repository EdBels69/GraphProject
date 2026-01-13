
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JobManager } from '../../api/services/jobs/JobManager'
import { jobRepository } from '../../api/repositories/JobRepository'
import { articleRepository } from '../../api/repositories/ArticleRepository'
import { socketService } from '../../api/services/SocketService'
import { ResearchJobRequest } from '../../shared/contracts/research'

// Mock dependencies
vi.mock('../../api/repositories/JobRepository', () => ({
    jobRepository: {
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findAllByUserId: vi.fn(),
        saveWithArticles: vi.fn()
    }
}))

vi.mock('../../api/repositories/ArticleRepository', () => ({
    articleRepository: {
        saveJobArticles: vi.fn()
    }
}))

vi.mock('../../api/services/SocketService', () => ({
    socketService: {
        emitJobProgress: vi.fn()
    }
}))

vi.mock('../../api/services/jobLogger', () => ({
    jobLogger: {
        log: vi.fn()
    }
}))

describe('JobManager', () => {
    let jobManager: JobManager

    beforeEach(() => {
        vi.clearAllMocks()
        jobManager = new JobManager()
    })

    describe('createJob', () => {
        it('should create a new job and persist it', async () => {
            const request: ResearchJobRequest = {
                topic: 'test topic',
                mode: 'research'
            }
            const userId = 'user-1'

            // Mock repository methods
            const saveSpy = vi.spyOn(jobRepository, 'saveWithArticles').mockResolvedValue()

            const job = jobManager.createJob(request, userId)

            expect(job.topic).toBe('test topic')
            expect(job.userId).toBe(userId)
            expect(job.status).toBe('pending')
            expect(jobManager.getJob(job.id)).toBeDefined()

            // Verify persist (async check)
            await new Promise(resolve => setTimeout(resolve, 10))
            expect(saveSpy).toHaveBeenCalled()
        })
    })

    describe('updateJobStatus', () => {
        it('should update status and emit socket event', async () => {
            const request: ResearchJobRequest = { topic: 'test', mode: 'quick' }
            const job = jobManager.createJob(request, 'user-1')

            // Update expectations to use saveWithArticles
            const saveSpy = vi.spyOn(jobRepository, 'saveWithArticles').mockResolvedValue()

            await jobManager.updateJobStatus(job.id, 'searching')

            expect(job.status).toBe('searching')
            expect(socketService.emitJobProgress).toHaveBeenCalledWith(job.id, 0, undefined, 'searching')
            expect(saveSpy).toHaveBeenCalled()
        })
    })

    describe('deleteJob', () => {
        it('should delete job from memory and DB', async () => {
            const request: ResearchJobRequest = { topic: 'test', mode: 'quick' }
            const job = jobManager.createJob(request, 'user-1')

            vi.spyOn(jobRepository, 'delete').mockResolvedValue({ id: job.id } as any)

            const result = await jobManager.deleteJob(job.id, 'user-1')

            expect(result).toBe(true)
            expect(jobManager.getJob(job.id)).toBeUndefined()
            expect(jobRepository.delete).toHaveBeenCalledWith(job.id)
        })

        it('should perform soft delete/cancellation if job is active', async () => {
            const request: ResearchJobRequest = { topic: 'test', mode: 'quick' }
            const job = jobManager.createJob(request, 'user-1')
            job.status = 'searching'

            const saveSpy = vi.spyOn(jobRepository, 'saveWithArticles').mockResolvedValue()
            vi.spyOn(jobRepository, 'delete').mockResolvedValue({ id: job.id } as any)

            await jobManager.deleteJob(job.id, 'user-1')

            // Cancellation triggers persistJob, so saveWithArticles should be called with cancelled status
            expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }))
        })
    })
})
