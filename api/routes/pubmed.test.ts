import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// Mock dependencies
vi.mock('../services/pubmedService', () => ({
    pubmedService: {
        getArticles: vi.fn(),
        getCitationNetwork: vi.fn(),
        fetchArticleDetails: vi.fn()
    }
}))

vi.mock('../../shared/graphStorage', () => ({
    GraphStorage: {
        initialize: vi.fn(),
        save: vi.fn()
    }
}))

vi.mock('../../src/core/Logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}))

import pubmedRouter from './pubmed'
import { pubmedService } from '../services/pubmedService'

const app = express()
app.use(express.json())
app.use('/pubmed', pubmedRouter)

describe('PubMed Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /pubmed/search', () => {
        it('should return articles for valid query', async () => {
            const mockArticles = [
                { pmid: '12345', title: 'Test Article', authors: ['Author 1'] }
            ]

            vi.mocked(pubmedService.getArticles).mockResolvedValueOnce(mockArticles as any)

            const response = await request(app)
                .get('/pubmed/search')
                .query({ q: 'cancer research' })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toEqual(mockArticles)
        })

        it('should return 400 for empty query', async () => {
            const response = await request(app)
                .get('/pubmed/search')
                .query({ q: '' })

            expect(response.status).toBe(400)
            expect(response.body.success).toBe(false)
        })

        it('should handle maxResults parameter', async () => {
            vi.mocked(pubmedService.getArticles).mockResolvedValueOnce([] as any)

            await request(app)
                .get('/pubmed/search')
                .query({ q: 'test', maxResults: '10' })

            expect(pubmedService.getArticles).toHaveBeenCalledWith(
                'test',
                expect.objectContaining({ maxResults: 10 })
            )
        })

        it('should return 500 on service error', async () => {
            vi.mocked(pubmedService.getArticles).mockRejectedValueOnce(new Error('API Error'))

            const response = await request(app)
                .get('/pubmed/search')
                .query({ q: 'test' })

            expect(response.status).toBe(500)
            expect(response.body.success).toBe(false)
        })
    })

    describe('POST /pubmed/network', () => {
        it('should create citation network for valid query', async () => {
            const mockNetwork = {
                nodes: [{ id: '1', label: 'Article 1' }],
                edges: [{ source: '1', target: '2' }]
            }

            vi.mocked(pubmedService.getCitationNetwork).mockResolvedValueOnce(mockNetwork as any)

            const response = await request(app)
                .post('/pubmed/network')
                .send({ query: 'cancer' })

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.graph).toBeDefined()
            expect(response.body.data.stats).toBeDefined()
        })

        it('should return 400 for missing query', async () => {
            const response = await request(app)
                .post('/pubmed/network')
                .send({})

            expect(response.status).toBe(400)
        })
    })

    describe('GET /pubmed/article/:pmid', () => {
        it('should return article details for valid PMID', async () => {
            const mockArticle = {
                uid: '12345',
                title: 'Test Article',
                abstractText: 'Abstract text',
                authors: [{ name: 'John Doe' }],
                journalInfo: { pubDate: '2024-01-01' },
                keywords: [{ name: 'keyword1' }]
            }

            vi.mocked(pubmedService.fetchArticleDetails).mockResolvedValueOnce([mockArticle] as any)

            const response = await request(app)
                .get('/pubmed/article/12345')

            expect(response.status).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.id).toBe('12345')
            expect(response.body.data.title).toBe('Test Article')
        })

        it('should return 404 for non-existent article', async () => {
            vi.mocked(pubmedService.fetchArticleDetails).mockResolvedValueOnce([])

            const response = await request(app)
                .get('/pubmed/article/99999999')

            expect(response.status).toBe(404)
            expect(response.body.success).toBe(false)
        })

        it('should return 500 on service error', async () => {
            vi.mocked(pubmedService.fetchArticleDetails).mockRejectedValueOnce(new Error('API Error'))

            const response = await request(app)
                .get('/pubmed/article/12345')

            expect(response.status).toBe(500)
            expect(response.body.success).toBe(false)
        })
    })
})
