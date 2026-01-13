import express from 'express'
import { graphMethodRegistry } from '../modules/graph/GraphMethodRegistry'
import { databaseManager } from '../core/Database'
import { logger } from '../core/Logger'

const router = express.Router()

/**
 * GET /api/methods
 * List all available graph construction methods
 */
router.get('/', (req, res) => {
    try {
        const methods = graphMethodRegistry.list().map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            category: m.category,
            icon: m.icon,
            requiredFields: m.requiredFields,
            configSchema: m.configSchema
        }))

        res.json({ methods })
    } catch (error) {
        logger.error('MethodsAPI', 'Error listing methods', { error })
        res.status(500).json({ error: 'Failed to list methods' })
    }
})

/**
 * POST /api/methods/:id/validate
 * Validate if a set of articles (by job ID) is suitable for this method
 */
router.post('/:id/validate', async (req: any, res) => {
    try {
        const { id } = req.params
        const { jobId } = req.body
        const userId = req.user?.id || 'local-admin' // Fallback for now

        const method = graphMethodRegistry.get(id)
        if (!method) {
            return res.status(404).json({ error: 'Method not found' })
        }

        // Get articles from job
        const job = await databaseManager.getJob(jobId, userId)
        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        // Convert Prisma article to Contract article (partial mapping)
        // TODO: Full mapping in a separate mapper
        const articles: any[] = job.articles.map(a => ({
            ...a,
            keywords: JSON.parse(a.authors || '[]'), // TODO: Fix keywords/authors mapping in DB
            metadata: {}
        }))

        const validation = method.validate(articles)
        res.json(validation)

    } catch (error) {
        logger.error('MethodsAPI', 'Error validating method', { error })
        res.status(500).json({ error: 'Validation failed' })
    }
})

export default router
