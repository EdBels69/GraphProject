/**
 * MeSH API Routes
 * Endpoints for MeSH term lookup and normalization
 */

import { Router } from 'express'
import { searchMeSH, normalizeTerm, normalizeTerms, getMeSHCacheStats, clearMeSHCache } from '../services/meshService'
import { logger } from '../../src/core/Logger'

const router = Router()

/**
 * GET /api/mesh/search
 * Search MeSH for a term
 */
router.get('/search', async (req, res) => {
    try {
        const { term } = req.query

        if (!term || typeof term !== 'string') {
            return res.status(400).json({ error: 'Term is required' })
        }

        const result = await searchMeSH(term)

        res.json({
            term,
            ...result
        })
    } catch (error) {
        logger.error('MeSHRoute', 'Search failed', { error })
        res.status(500).json({ error: 'MeSH search failed' })
    }
})

/**
 * POST /api/mesh/normalize
 * Normalize a single term
 */
router.post('/normalize', async (req, res) => {
    try {
        const { term } = req.body

        if (!term || typeof term !== 'string') {
            return res.status(400).json({ error: 'Term is required' })
        }

        const result = await normalizeTerm(term)

        res.json({
            original: term,
            ...result
        })
    } catch (error) {
        logger.error('MeSHRoute', 'Normalize failed', { error })
        res.status(500).json({ error: 'Normalization failed' })
    }
})

/**
 * POST /api/mesh/normalize-batch
 * Normalize multiple terms
 */
router.post('/normalize-batch', async (req, res) => {
    try {
        const { terms } = req.body

        if (!terms || !Array.isArray(terms)) {
            return res.status(400).json({ error: 'Terms array is required' })
        }

        if (terms.length > 50) {
            return res.status(400).json({ error: 'Maximum 50 terms per request' })
        }

        const results = await normalizeTerms(terms)

        res.json({
            count: terms.length,
            results: Object.fromEntries(results)
        })
    } catch (error) {
        logger.error('MeSHRoute', 'Batch normalize failed', { error })
        res.status(500).json({ error: 'Batch normalization failed' })
    }
})

/**
 * GET /api/mesh/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', (req, res) => {
    const stats = getMeSHCacheStats()
    res.json(stats)
})

/**
 * POST /api/mesh/cache/clear
 * Clear the MeSH cache
 */
router.post('/cache/clear', (req, res) => {
    clearMeSHCache()
    res.json({ success: true, message: 'Cache cleared' })
})

export default router
