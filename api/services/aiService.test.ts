import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { setFeature } from '../../shared/config/features'

// Mock fetch globally before any imports
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock logger
vi.mock('../../src/core/Logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}))

// Import after mocks
import {
    chatCompletion,
    extractEntitiesWithAI,
    summarizeDocument,
    checkAIHealth
} from './aiService'

describe('AI Service', () => {
    beforeAll(() => {
        // Enable AI features for all tests
        setFeature('USE_AI_FEATURES', true)
    })

    beforeEach(() => {
        vi.clearAllMocks()
        // Ensure AI features are enabled before each test
        setFeature('USE_AI_FEATURES', true)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('chatCompletion', () => {
        it('should send a chat completion request and return response', async () => {
            const mockResponse = {
                choices: [{ message: { content: 'Hello, I am an AI assistant.' } }],
                model: 'gpt-4',
                usage: {
                    prompt_tokens: 10,
                    completion_tokens: 20,
                    total_tokens: 30
                }
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            const result = await chatCompletion([
                { role: 'user', content: 'Hello' }
            ])

            expect(result.content).toBe('Hello, I am an AI assistant.')
            expect(result.model).toBe('gpt-4')
            expect(result.usage?.totalTokens).toBe(30)
        })

        it('should throw error when API returns error', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => 'Internal Server Error'
            })

            await expect(chatCompletion([
                { role: 'user', content: 'Hello' }
            ])).rejects.toThrow('AI API error')
        })

        it('should throw when AI features are disabled', async () => {
            setFeature('USE_AI_FEATURES', false)

            await expect(chatCompletion([
                { role: 'user', content: 'Hello' }
            ])).rejects.toThrow('AI features are disabled')

            // Re-enable for other tests
            setFeature('USE_AI_FEATURES', true)
        })

        it('should use default options when not provided', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'Response' } }]
                })
            })

            await chatCompletion([{ role: 'user', content: 'Test' }])

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: expect.stringContaining('"temperature":0.7')
                })
            )
        })
    })

    describe('extractEntitiesWithAI', () => {
        it('should extract entities from text', async () => {
            const mockEntities = [
                { name: 'p53', type: 'protein', confidence: 0.95 },
                { name: 'BRCA1', type: 'gene', confidence: 0.9 }
            ]

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: JSON.stringify(mockEntities) } }]
                })
            })

            const result = await extractEntitiesWithAI('The p53 protein interacts with BRCA1 gene.')

            expect(result).toHaveLength(2)
            expect(result[0].name).toBe('p53')
            expect(result[0].type).toBe('protein')
        })

        it('should return empty array on parse error', async () => {
            // First call returns invalid JSON
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'not valid json' } }]
                })
            })
            // Retry also returns invalid JSON
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'still not valid' } }]
                })
            })

            const result = await extractEntitiesWithAI('Some text')

            expect(result).toEqual([])
        })
    })

    describe('summarizeDocument', () => {
        it('should summarize a document', async () => {
            const mockSummary = {
                summary: 'This is a summary.',
                keyFindings: ['Finding 1', 'Finding 2'],
                entities: [{ name: 'Entity1', type: 'protein', confidence: 0.8 }],
                keywords: ['keyword1', 'keyword2']
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: JSON.stringify(mockSummary) } }]
                })
            })

            const result = await summarizeDocument('Long document text...', 'Document Title')

            expect(result.title).toBe('Document Title')
            expect(result.summary).toBe('This is a summary.')
            expect(result.keyFindings).toHaveLength(2)
        })
    })

    describe('checkAIHealth', () => {
        it('should return available true when API is healthy', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: [{ id: 'gpt-4' }]
                })
            })

            const result = await checkAIHealth()

            expect(result.available).toBe(true)
            expect(result.model).toBe('gpt-4')
        })

        it('should return available false when API fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401
            })

            const result = await checkAIHealth()

            expect(result.available).toBe(false)
            expect(result.error).toContain('401')
        })

        it('should return disabled when AI features are off', async () => {
            setFeature('USE_AI_FEATURES', false)

            const result = await checkAIHealth()

            expect(result.available).toBe(false)
            expect(result.error).toContain('disabled')

            // Re-enable
            setFeature('USE_AI_FEATURES', true)
        })
    })
})
