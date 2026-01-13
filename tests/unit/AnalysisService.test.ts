
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnalysisService } from '../../api/services/analysis/AnalysisService'
import { jobManager } from '../../api/services/jobs/JobManager'
import { unpaywallService } from '../../api/services/unpaywallService'
import { entityExtractor } from '../../api/services/entityExtractor'
import { relationExtractor } from '../../api/services/relationExtractor'
import chunkingEngine from '../../api/services/chunkingEngine'
import { fileStorage } from '../../api/services/fileStorage'
import { ArticleSource, ResearchJob } from '../../shared/contracts/research'

// Mocks
vi.mock('../../api/services/jobs/JobManager', () => ({
    jobManager: {
        updateJobStatus: vi.fn(),
        updateProgress: vi.fn(),
        log: vi.fn(),
        persistJob: vi.fn(),
        getJob: vi.fn()
    }
}))

vi.mock('../../api/services/unpaywallService', () => ({
    unpaywallService: {
        batchFindPdfs: vi.fn()
    }
}))

vi.mock('../../api/services/entityExtractor', () => ({
    entityExtractor: {
        extractFromChunks: vi.fn()
    }
}))

vi.mock('../../api/services/relationExtractor', () => ({
    relationExtractor: {
        extractRelations: vi.fn()
    }
}))

vi.mock('../../api/services/chunkingEngine', () => ({
    default: {
        chunkText: vi.fn()
    }
}))

vi.mock('../../api/services/fileStorage', () => ({
    fileStorage: {
        savePDF: vi.fn(),
        saveText: vi.fn()
    }
}))

vi.mock('axios')

describe('AnalysisService', () => {
    let analysisService: AnalysisService
    let mockJob: ResearchJob

    beforeEach(() => {
        vi.clearAllMocks()
        analysisService = new AnalysisService()
        mockJob = {
            id: 'job-1',
            userId: 'user-1',
            topic: 'test',
            status: 'analyzing',
            progress: 0,
            articlesFound: 0,
            articlesProcessed: 0,
            createdAt: '',
            updatedAt: '',
            queries: []
        }
    })

    describe('executePdfDiscoveryPhase', () => {
        it('should find PDFs and update job', async () => {
            const articles: ArticleSource[] = [
                { id: '1', title: 't1', source: 'pubmed', doi: '10.123/a' },
                { id: '2', title: 't2', source: 'pubmed', doi: '10.123/b' }
            ]

            const mockPdfs = new Map()
            mockPdfs.set('10.123/a', { pdfUrl: 'http://pdf.com/a.pdf' })

            vi.spyOn(unpaywallService, 'batchFindPdfs').mockResolvedValue(mockPdfs)

            const result = await analysisService.executePdfDiscoveryPhase(mockJob, articles)

            expect(result[0].pdfUrl).toBe('http://pdf.com/a.pdf')
            expect(result[1].pdfUrl).toBeUndefined()
            expect(jobManager.updateJobStatus).toHaveBeenCalledWith('job-1', 'downloading', expect.any(String))
            expect(jobManager.persistJob).toHaveBeenCalled()
        })
    })

    describe('executeAnalysisPhase', () => {
        it('should analyze articles in batches', async () => {
            const articles: ArticleSource[] = [
                { id: '1', title: 't1', source: 'pubmed', abstract: 'abstract 1' },
                { id: '2', title: 't2', source: 'pubmed', abstract: 'abstract 2' }
            ]

            vi.spyOn(jobManager, 'getJob').mockReturnValue(mockJob)
            vi.spyOn(chunkingEngine, 'chunkText').mockResolvedValue(['chunk1'])
            vi.spyOn(entityExtractor, 'extractFromChunks').mockResolvedValue({ entities: [{ name: 'E1' }] } as any)
            vi.spyOn(relationExtractor, 'extractRelations').mockResolvedValue({ relations: [] } as any)

            const result = await analysisService.executeAnalysisPhase(mockJob, articles, { topic: 'test', mode: 'quick' })

            expect(result.entities).toHaveLength(2) // 1 entity per article
            expect(jobManager.updateProgress).toHaveBeenCalled()
            expect(entityExtractor.extractFromChunks).toHaveBeenCalledTimes(2)
        })

        it('should stop if job is cancelled', async () => {
            const articles: ArticleSource[] = [
                { id: '1', title: 't1', source: 'pubmed', abstract: 'abstract 1' },
                { id: '2', title: 't2', source: 'pubmed', abstract: 'abstract 2' }
            ]

            // Mock job becoming cancelled during processing
            vi.spyOn(jobManager, 'getJob').mockReturnValue({ ...mockJob, status: 'cancelled' })

            const result = await analysisService.executeAnalysisPhase(mockJob, articles, { topic: 'test', mode: 'search' })

            // Should not process any
            expect(entityExtractor.extractFromChunks).not.toHaveBeenCalled()
        })
    })
})
