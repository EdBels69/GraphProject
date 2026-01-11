
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PubMedSource } from '../../../api/services/search/sources/PubMedSource';
import { pubmedService } from '../../../api/services/pubmedService';

// Mock the pubmedService dependency
vi.mock('../../../api/services/pubmedService', () => ({
    pubmedService: {
        getArticles: vi.fn(),
    },
}));

describe('PubMedSource', () => {
    let source: PubMedSource;

    beforeEach(() => {
        source = new PubMedSource();
        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(source).toBeDefined();
        expect(source.name).toBe('pubmed');
    });

    it('should search and map results correctly', async () => {
        const mockArticles = [
            {
                id: '12345',
                title: 'Test Article',
                authors: ['Author A', 'Author B'],
                year: 2023,
                abstract: 'Test Abstract',
                doi: '10.1000/12345',
                url: 'http://example.com',
            },
        ];

        // Setup mock return value
        vi.mocked(pubmedService.getArticles).mockResolvedValue({
            articles: mockArticles,
            total: 1
        } as any);

        const results = await source.search('test query', { maxResults: 10 });

        expect(pubmedService.getArticles).toHaveBeenCalledWith('test query', {
            maxResults: 10,
            fromDate: undefined,
            toDate: undefined,
            fetchCitations: false,
        });

        expect(results).toHaveLength(1);
        expect(results[0]).toEqual({
            id: 'pubmed-12345',
            source: 'pubmed',
            title: 'Test Article',
            authors: ['Author A', 'Author B'],
            year: 2023,
            abstract: 'Test Abstract',
            doi: '10.1000/12345',
            url: 'http://example.com',
            citations: undefined,
            relevanceScore: 1,
        });
    });

    it('should handled errors gracefully and return empty array', async () => {
        vi.mocked(pubmedService.getArticles).mockRejectedValue(new Error('API Error'));

        const results = await source.search('fail query');

        expect(results).toEqual([]);
        expect(pubmedService.getArticles).toHaveBeenCalled();
    });

    it('should pass date filters correctly', async () => {
        vi.mocked(pubmedService.getArticles).mockResolvedValue({ articles: [], total: 0 } as any);

        await source.search('date test', { fromDate: '2020', toDate: '2021' });

        expect(pubmedService.getArticles).toHaveBeenCalledWith('date test', expect.objectContaining({
            fromDate: '2020',
            toDate: '2021',
        }));
    });
});
