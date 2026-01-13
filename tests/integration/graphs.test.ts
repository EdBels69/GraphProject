
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../api/app'

// Mock GraphController methods directly 
vi.mock('../../api/controllers/GraphController', () => ({
    GraphController: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getNodes: vi.fn(),
        addNode: vi.fn(),
        deleteNode: vi.fn(),
        getEdges: vi.fn(),
        addEdge: vi.fn(),
        deleteEdge: vi.fn(),
        upload: vi.fn(),
        getCentrality: vi.fn(),
        getShortestPath: vi.fn(),
        getAllShortestPaths: vi.fn(),
        checkConnectivity: vi.fn(),
        getStatistics: vi.fn(),
        validate: vi.fn(),
        research: vi.fn(),
        exportGEXF: vi.fn(),
        exportPDF: vi.fn()
    }
}))

import { GraphRuntimeService } from '../../api/services/GraphRuntimeService'
vi.mock('../../api/services/GraphRuntimeService', () => ({
    graphRuntime: {
        initialize: vi.fn()
    }
}))

import { GraphController } from '../../api/controllers/GraphController'

describe('Graphs API Integration', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/graphs', () => {
        it('should return all graphs', async () => {
            vi.mocked(GraphController.getAll).mockImplementation((req, res) => {
                res.json({ graphs: [] })
            })

            const res = await request(app).get('/api/graphs')

            expect(res.status).toBe(200)
            expect(res.body.graphs).toEqual([])
            expect(GraphController.getAll).toHaveBeenCalled()
        })
    })

    describe('POST /api/graphs/:id/validate', () => {
        it('should validate graph', async () => {
            vi.mocked(GraphController.validate).mockImplementation((req, res) => {
                res.json({ valid: true })
            })

            const res = await request(app).post('/api/graphs/123/validate')

            expect(res.status).toBe(200)
            expect(res.body.valid).toBe(true)
        })
    })
})
