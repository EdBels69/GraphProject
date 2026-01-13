import express from 'express'
import { batchPdfDownloader } from '../services/BatchPdfDownloader'
import { logger } from '../core/Logger'

const router = express.Router()

/**
 * POST /api/research/jobs/:id/download-batch
 * Trigger batch PDF download
 */
router.post('/jobs/:id/download-batch', async (req: any, res) => {
    try {
        const { id } = req.params
        const { articleIds } = req.body
        const userId = req.user.id

        if (!articleIds || !Array.isArray(articleIds)) {
            return res.status(400).json({ error: 'articleIds array required' })
        }

        const result = await batchPdfDownloader.startBatchDownload(id, articleIds, userId)
        res.json(result)

    } catch (error) {
        logger.error('BatchDownloadAPI', 'Error starting batch download', { error })
        res.status(500).json({ error: 'Failed to start batch download' })
    }
})

export default router
