import express from 'express'
import { generateReport } from '../services/aiService'
import { databaseManager } from '../core/Database'
import { gapFinder } from '../modules/analysis/GapFinder'
import { logger } from '../core/Logger'
import { UniversalGraph } from '../../shared/contracts/graph'

const router = express.Router()

/**
 * POST /api/analysis/report/:jobId
 * Generate a full research report
 */
router.post('/report/:jobId', async (req: any, res) => {
    try {
        const { jobId } = req.params
        const userId = req.user.id

        // 1. Fetch Job & Articles
        const job = await databaseManager.getJob(jobId, userId)
        if (!job) return res.status(404).json({ error: 'Job not found' })

        // 2. Fetch Graph
        let graph: any = { nodes: [], edges: [] }
        if (job.graphId) {
            const graphRecord = await databaseManager.getClient().graph.findUnique({
                where: { id: job.graphId }
            })
            if (graphRecord) {
                graph = {
                    ...JSON.parse(JSON.stringify(graphRecord)),
                    nodes: JSON.parse(graphRecord.nodes as string),
                    edges: JSON.parse(graphRecord.edges as string),
                    metrics: JSON.parse(graphRecord.metrics as string || '{}')
                }
            }
        }

        // 3. Run Gap Analysis
        let gaps: any[] = []
        if (graph.nodes.length > 0) {
            const uGraph: UniversalGraph = { ...graph, id: graph.id || 'temp', version: '3.0' }
            gaps = await gapFinder.findGaps(uGraph)
        }

        // 4. Generate Report
        const reportMarkdown = await generateReport(job.topic, job.articles, graph, gaps)

        res.json({ report: reportMarkdown })

    } catch (error) {
        logger.error('ReportAPI', 'Report generation failed', { error })
        res.status(500).json({ error: 'Failed to generate report' })
    }
})

export default router
