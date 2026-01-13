
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

const mocks = vi.hoisted(() => ({
    documentParser: {
        parsePDF: vi.fn(),
        parseFromURL: vi.fn()
    },
    entityExtractor: {
        extractFromChunks: vi.fn()
    },
    relationExtractor: {
        extractRelations: vi.fn()
    },
    id: {
        buildGraph: vi.fn()
    },
    chunkingEngine: {
        chunkText: vi.fn(),
        chunkDocument: vi.fn()
    }
}))

vi.mock('../../api/services/documentParser', () => ({
    DocumentParser: vi.fn(() => mocks.documentParser)
}))
vi.mock('../../api/services/chunkingEngine', () => ({
    ChunkingEngine: vi.fn(() => mocks.chunkingEngine)
}))
vi.mock('../../api/services/entityExtractor', () => ({
    EntityExtractor: vi.fn(() => mocks.entityExtractor)
}))
vi.mock('../../api/services/relationExtractor', () => ({
    RelationExtractor: vi.fn(() => mocks.relationExtractor)
}))
vi.mock('../../api/services/knowledgeGraphBuilder', () => ({
    KnowledgeGraphBuilder: vi.fn(() => mocks.id)
}))

import { app } from '../../api/app'

describe('Documents API Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/documents/upload', () => {
        it('should upload and process a file', async () => {
            const mockParsed = {
                id: 'doc-1',
                title: 'Test Doc',
                content: 'Test Content',
                metadata: { pageCount: 1, extractedAt: new Date() }
            }
            mocks.documentParser.parsePDF.mockResolvedValue(mockParsed)
            mocks.chunkingEngine.chunkText.mockResolvedValue([])
            mocks.entityExtractor.extractFromChunks.mockResolvedValue({
                statistics: { totalEntities: 5 },
                entities: []
            })
            mocks.relationExtractor.extractRelations.mockResolvedValue({
                statistics: { totalRelations: 2 },
                relations: []
            })
            mocks.id.buildGraph.mockResolvedValue({
                graph: { nodes: [], edges: [] }
            })

            const res = await request(app)
                .post('/api/documents/upload')
                .attach('file', Buffer.from('fake-pdf-content'), 'test.pdf')

            expect(res.status).toBe(200)
            expect(res.body.document.title).toBe('Test Doc')
            expect(res.body.entities.totalEntities).toBe(5)
            expect(mocks.documentParser.parsePDF).toHaveBeenCalled()
        })
    })

    describe('POST /api/documents/url', () => {
        it('should process URL', async () => {
            const mockParsed = {
                id: 'doc-url-1',
                title: 'URL Doc',
                content: 'URL Content',
                metadata: { extractedAt: new Date() }
            }
            mocks.documentParser.parseFromURL.mockResolvedValue(mockParsed)
            mocks.chunkingEngine.chunkText.mockResolvedValue([])
            mocks.entityExtractor.extractFromChunks.mockResolvedValue({ statistics: {}, entities: [] })
            mocks.relationExtractor.extractRelations.mockResolvedValue({ statistics: {}, relations: [] })
            mocks.id.buildGraph.mockResolvedValue({ graph: { nodes: [], edges: [] } })

            const res = await request(app)
                .post('/api/documents/url')
                .send({ url: 'http://example.com' })

            expect(res.status).toBe(200)
            expect(res.body.document.url).toBe('http://example.com')
        })
    })
})
