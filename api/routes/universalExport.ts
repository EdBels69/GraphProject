import express from 'express'
import { graphExporterRegistry } from '../modules/export/GraphExporterRegistry'
import { databaseManager } from '../core/Database'
import { logger } from '../core/Logger'
import { UniversalGraph } from '../../shared/contracts/graph'

const router = express.Router()

/**
 * GET /api/export/formats
 * List available export formats
 */
router.get('/formats', (req, res) => {
    const formats = graphExporterRegistry.list().map(e => ({
        id: e.id,
        name: e.name,
        extension: e.extension,
        mimeType: e.mimeType
    }))
    res.json(formats)
})

/**
 * GET /api/export/graphs/:graphId/:formatId
 * Export a graph in specific format
 */
router.get('/graphs/:graphId/:formatId', async (req: any, res) => {
    try {
        const { graphId, formatId } = req.params
        const userId = req.user.id

        const exporter = graphExporterRegistry.get(formatId)
        if (!exporter) {
            return res.status(404).json({ error: 'Export format not supported' })
        }

        // 1. Fetch Graph
        const graphRecord = await databaseManager.getClient().graph.findUnique({
            where: { id: graphId }
        })

        if (!graphRecord) return res.status(404).json({ error: 'Graph not found' })

        // 2. Fetch Job Articles (for Obsidian context)
        let articles: any[] = []
        if (graphRecord.jobId) {
            const job = await databaseManager.getJob(graphRecord.jobId, userId)
            if (job) articles = job.articles
        }

        // 3. Convert to Universal Graph
        const graph: UniversalGraph = {
            id: graphRecord.id,
            version: '3.0',
            metadata: JSON.parse(graphRecord.metadata as string || '{}'),
            nodes: JSON.parse(graphRecord.nodes as string),
            edges: JSON.parse(graphRecord.edges as string),
            metrics: JSON.parse(graphRecord.metrics as string || '{}')
        }

        // 4. Export
        const result = await exporter.export(graph, { articles })

        // 5. Send
        res.setHeader('Content-Type', result.mimeType || 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
        res.send(result.data)

    } catch (error) {
        logger.error('ExportAPI', 'Graph export failed', { error })
        res.status(500).json({ error: 'Failed to export graph' })
    }
})

export default router
