
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchOrchestrator } from '../../../api/services/search/SearchOrchestrator';
import { jobManager } from '../../../api/services/jobs/JobManager';
import globalSearch from '../../../api/services/globalSearch';
import { ResearchJob, ResearchJobRequest } from '../../../shared/contracts/research';

// Mock dependencies
vi.mock('../../../api/services/jobs/JobManager');
vi.mock('../../../api/services/globalSearch');
vi.mock('../../../api/services/aiService', () => ({
    chatCompletion: vi.fn()
}));
vi.mock('../../../shared/config/features', () => ({
    isFeatureEnabled: vi.fn().mockReturnValue(false) // Start with AI disabled
}));

describe('SearchOrchestrator', () => {
    let orchestrator: SearchOrchestrator;
    let mockJob: ResearchJob;
    let mockRequest: ResearchJobRequest;

    beforeEach(() => {
        orchestrator = new SearchOrchestrator();
        vi.clearAllMocks();

        mockJob = {
            id: 'job-123',
            userId: 'user-1',
            topic: 'test topic',
            mode: 'research',
            status: 'pending',
            progress: 0,
            queries: [],
            articlesFound: 0,
            articlesProcessed: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockRequest = {
            topic: 'test topic',
            mode: 'research',
            sources: ['pubmed']
        };
    });

    it('should execute search phase correctly (AI disabled)', async () => {
        // Setup mocks
        const mockArticles = [
            {
                id: '1',
                source: 'pubmed',
                title: 'Article 1',
                authors: ['A. B.'],
                doi: '10.1000/1',
                relevanceScore: 1
            }
        ];

        vi.mocked(globalSearch.search).mockResolvedValue({
            query: 'test topic',
            totalResults: 1,
            results: mockArticles,
            bySource: { pubmed: mockArticles },
            executionTime: 100
        } as any);

        const results = await orchestrator.executeSearchPhase(mockJob, mockRequest);

        // Verify JobManager interactions
        expect(jobManager.updateJobStatus).toHaveBeenCalledWith('job-123', 'searching', expect.any(String));
        expect(jobManager.updateProgress).toHaveBeenCalled();
        expect(jobManager.persistJob).toHaveBeenCalled();
        expect(jobManager.log).toHaveBeenCalledWith('job-123', 'search', expect.stringContaining('Executing search'));

        // Verify GlobalSearch interaction
        expect(globalSearch.search).toHaveBeenCalledWith(expect.objectContaining({
            query: 'test topic',
            sources: ['pubmed']
        }));

        // Verify results
        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Article 1');

        // Verify job object update
        expect(mockJob.articlesFound).toBe(1);
        expect(mockJob.queries).toContain('test topic');
    });

    it('should filter articles by quartiles', async () => {
        mockRequest.scopusQuartile = ['Q1'];

        const mockArticles = [
            { title: 'Good Paper', scopusQuartile: 'Q1', relevanceScore: 1 },
            { title: 'Bad Paper', scopusQuartile: 'Q3', relevanceScore: 1 }
        ];

        vi.mocked(globalSearch.search).mockResolvedValue({
            results: mockArticles
        } as any);

        const results = await orchestrator.executeSearchPhase(mockJob, mockRequest);

        expect(results).toHaveLength(1);
        expect(results[0].title).toBe('Good Paper');
        expect(jobManager.log).toHaveBeenCalledWith(expect.any(String), 'info', expect.stringContaining('Filtering by metrics'));
    });
});
