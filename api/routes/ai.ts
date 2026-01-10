/**
 * AI API Routes
 * Endpoints for AI-powered features
 */

import { Router } from 'express'
import {
    chatCompletion,
    extractEntitiesWithAI,
    summarizeDocument,
    askAboutGraph,
    generateResearchRecommendations,
    checkAIHealth
} from '../services/aiService'
import { logger } from '../core/Logger'

const router = Router()

/**
 * GET /api/ai/health
 * Check AI service availability
 */
router.get('/health', async (req, res) => {
    try {
        const health = await checkAIHealth()
        res.json(health)
    } catch (error) {
        res.json({ available: false, error: String(error) })
    }
})

/**
 * POST /api/ai/chat
 * Send a chat message
 */
router.post('/chat', async (req, res) => {
    try {
        const { messages, options } = req.body

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' })
        }

        const response = await chatCompletion(messages, options)
        res.json(response)
    } catch (error) {
        logger.error('AIRoute', 'Chat failed', { error })
        res.status(500).json({ error: 'Chat request failed' })
    }
})

/**
 * POST /api/ai/chat-stream
 * Send a streaming chat message
 */
router.post('/chat-stream', async (req, res) => {
    try {
        const { messages, options } = req.body

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' })
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        const { chatCompletionStream } = await import('../services/aiService')

        await chatCompletionStream(messages, options, (chunk) => {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
        })

        res.write('data: [DONE]\n\n')
        res.end()
    } catch (error) {
        logger.error('AIRoute', 'Streaming chat failed', { error })
        res.status(500).json({ error: 'Streaming chat request failed' })
    }
})

/**
 * POST /api/ai/extract-entities
 * Extract entities from text using AI
 */
router.post('/extract-entities', async (req, res) => {
    try {
        const { text } = req.body

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' })
        }

        const entities = await extractEntitiesWithAI(text)
        res.json({ entities })
    } catch (error) {
        logger.error('AIRoute', 'Entity extraction failed', { error })
        res.status(500).json({ error: 'Entity extraction failed' })
    }
})

/**
 * POST /api/ai/summarize
 * Summarize a document
 */
router.post('/summarize', async (req, res) => {
    try {
        const { text, title } = req.body

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' })
        }

        const summary = await summarizeDocument(text, title)
        res.json(summary)
    } catch (error) {
        logger.error('AIRoute', 'Summarization failed', { error })
        res.status(500).json({ error: 'Summarization failed' })
    }
})

/**
 * POST /api/ai/ask-graph
 * Ask a question about the graph
 */
router.post('/ask-graph', async (req, res) => {
    try {
        const { question, graphContext } = req.body

        if (!question || typeof question !== 'string') {
            return res.status(400).json({ error: 'Question is required' })
        }

        if (!graphContext || !graphContext.nodes) {
            return res.status(400).json({ error: 'Graph context is required' })
        }

        const answer = await askAboutGraph(question, graphContext)
        res.json({ answer })
    } catch (error) {
        logger.error('AIRoute', 'Graph question failed', { error })
        res.status(500).json({ error: 'Question processing failed' })
    }
})

/**
 * POST /api/ai/recommendations
 * Generate research recommendations
 */
router.post('/recommendations', async (req, res) => {
    try {
        const { gaps, nodeLabels } = req.body

        if (!gaps) {
            return res.status(400).json({ error: 'Gaps data is required' })
        }

        const labelMap = new Map<string, string>(Object.entries(nodeLabels || {}) as [string, string][])
        const recommendations = await generateResearchRecommendations(gaps, labelMap)
        res.json({ recommendations })
    } catch (error) {
        logger.error('AIRoute', 'Recommendations failed', { error })
        res.status(500).json({ error: 'Recommendations generation failed' })
    }
})

export default router
