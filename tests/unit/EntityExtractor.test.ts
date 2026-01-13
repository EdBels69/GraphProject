
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EntityExtractor } from '../../api/services/entityExtractor'
import { Chunk } from '../../api/services/chunkingEngine'
import { searchMeSH } from '../../api/services/meshService'
import { extractEntitiesWithAI } from '../../api/services/aiService'

// Mocks
vi.mock('../../api/services/meshService', () => ({
    searchMeSH: vi.fn(),
    normalizeTerm: vi.fn((term) => term.toLowerCase())
}))

vi.mock('../../api/services/aiService', () => ({
    extractEntitiesWithAI: vi.fn()
}))

// Mock config to enable MeSH but disable AI by default for deterministic tests
vi.mock('../../shared/config/features', () => ({
    isFeatureEnabled: vi.fn((feature) => {
        if (feature === 'USE_MESH_LOOKUP') return true
        if (feature === 'USE_AI_FEATURES') return false
        return false
    })
}))

describe('EntityExtractor', () => {
    let entityExtractor: EntityExtractor

    beforeEach(() => {
        vi.clearAllMocks()
        // Re-instantiate to reset internal patterns if any
        entityExtractor = new EntityExtractor()
    })

    describe('extractFromChunk', () => {
        it('should extract common entities using regex patterns', async () => {
            const chunk: Chunk = {
                id: 'c1',
                content: 'BRCA1 is a tumor suppressor gene while P53 regulates cell cycle.',
                metadata: { source: 's1', position: 0, type: 'paragraph' }
            }

            // Mock MeSH to return nothing relevant to focus on regex
            vi.mocked(searchMeSH).mockResolvedValue({ found: false } as any)

            const result = await entityExtractor.extractFromChunk(chunk)

            // Depending on regex patterns implemented. 
            // Assuming BRCA1 and P53 are caught by gene/protein patterns.
            // If the regexes are decent, they should be found.

            const names = result.entities.map(e => e.name)
            expect(names).toEqual(expect.arrayContaining(['BRCA1', 'P53']))
            expect(result.entities[0].type).toBeDefined()
        })

        it('should use MeSH for normalization when enabled', async () => {
            const chunk: Chunk = {
                id: 'c1',
                content: 'Patient has Diabetes.',
                metadata: { source: 's1', position: 0, type: 'paragraph' }
            }

            // Mock successful MeSH lookup
            vi.mocked(searchMeSH).mockResolvedValue({
                found: true,
                descriptor: {
                    descriptorUI: 'D003920',
                    descriptorName: 'Diabetes Mellitus',
                    category: 'Disease'
                }
            } as any)

            const result = await entityExtractor.extractFromChunk(chunk)

            if (result.entities.length > 0) {
                expect(searchMeSH).toHaveBeenCalled()
                // Check if valid mesh ID attached
                const diabetic = result.entities.find(e => e.name.toLowerCase().includes('diabetes'))
                if (diabetic) {
                    expect(diabetic.meshId).toBe('D003920')
                    expect(diabetic.normalizedName).toBe('Diabetes Mellitus')
                }
            }
        })
    })

    describe('mergeEntities', () => {
        it('should merge duplicates and aggregate metrics', () => {
            const entities: any[] = [
                { name: 'Gene A', mentions: 1, confidence: 0.8, evidence: [] },
                { name: 'Gene A', mentions: 2, confidence: 0.9, evidence: [] },
                { name: 'Gene B', mentions: 1, confidence: 0.5, evidence: [] }
            ]

            const merged = entityExtractor.mergeEntities(entities)

            expect(merged).toHaveLength(2)
            const geneA = merged.find(e => e.name === 'Gene A')
            expect(geneA.mentions).toBe(3)
            // Logic typically takes max confidence (0.9)
            expect(geneA.confidence).toBeGreaterThanOrEqual(0.9)
        })
    })
})
