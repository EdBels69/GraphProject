
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrossrefSource } from '../../../api/services/search/sources/CrossrefSource';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('CrossrefSource', () => {
    let source: CrossrefSource;

    beforeEach(() => {
        source = new CrossrefSource();
        vi.clearAllMocks();
    });

    it('should be defined', () => {
        expect(source).toBeDefined();
        expect(source.name).toBe('crossref');
    });

    it('should construct URL and parse response correctly', async () => {
        const mockResponse = {
            data: {
                message: {
                    items: [
                        {
                            DOI: '10.1001/test',
                            title: ['Test Crossref Article'],
                            author: [{ given: 'John', family: 'Doe' }],
                            published: { 'date-parts': [[2024]] },
                            abstract: '<jats:p>Abstract content</jats:p>',
                            URL: 'http://dx.doi.org/10.1001/test',
                            'is-referenced-by-count': 42,
                            reference: [{ DOI: '10.1001/ref1' }, { DOI: '10.1001/ref2' }],
                            score: 95.5
                        }
                    ]
                }
            }
        };

        vi.mocked(axios.get).mockResolvedValue(mockResponse);

        const results = await source.search('crossref query', { maxResults: 5 });

        // Verify URL construction
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('https://api.crossref.org/works?query=crossref%20query&rows=5'),
            expect.anything()
        );

        // Verify mapping
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual({
            id: '10.1001/test',
            source: 'crossref',
            title: 'Test Crossref Article',
            authors: ['John Doe'],
            year: 2024,
            abstract: 'Abstract content',
            doi: '10.1001/test',
            url: 'http://dx.doi.org/10.1001/test',
            citations: 42,
            references: ['10.1001/ref1', '10.1001/ref2'],
            relevanceScore: 95.5
        });
    });

    it('should handle date filters', async () => {
        vi.mocked(axios.get).mockResolvedValue({ data: { message: { items: [] } } });

        await source.search('test', { fromDate: '2020-01-01', toDate: '2020-12-31' });

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('filter=from-pub-date:2020-01-01,until-pub-date:2020-12-31'),
            expect.anything()
        );
    });

    it('should handle API errors gracefully', async () => {
        vi.mocked(axios.get).mockRejectedValue(new Error('Network Error'));

        const results = await source.search('fail');

        expect(results).toEqual([]);
    });

    it('should handle missing fields in response', async () => {
        const mockResponse = {
            data: {
                message: {
                    items: [
                        {
                            DOI: '10.1002/sparse',
                            // No title, author, year...
                        }
                    ]
                }
            }
        };
        vi.mocked(axios.get).mockResolvedValue(mockResponse as any);

        const results = await source.search('sparse');

        expect(results[0]).toEqual(expect.objectContaining({
            title: 'No Title',
            authors: [],
            year: undefined,
            citations: 0,
            references: []
        }));
    });
});
