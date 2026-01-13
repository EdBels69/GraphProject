import express from 'express'
import { gapFinder } from '../modules/analysis/GapFinder'
import { databaseManager } from '../core/Database'
import { UniversalGraph } from '../../shared/contracts/graph'
import { logger } from '../core/Logger'

const router = express.Router()

/**
 * POST /api/analysis/gaps/:graphId
 * Run gap analysis on a specific graph
 */
router.post('/gaps/:graphId', async (req: any, res) => {
    try {
        const { graphId } = req.params

        // 1. Fetch graph
        const graphRecord = await databaseManager.getClient().graph.findUnique({
            where: { id: graphId }
        })

        if (!graphRecord) return res.status(404).json({ error: 'Graph not found' })

        // 2. Hydrate UniversalGraph
        const graph: UniversalGraph = {
            id: graphRecord.id,
            version: '3.0',
            metadata: JSON.parse(graphRecord.metadata as string || '{}'),
            nodes: JSON.parse(graphRecord.nodes as string),
            edges: JSON.parse(graphRecord.edges as string),
            metrics: JSON.parse(graphRecord.metrics as string || '{}')
        }

        // 3. Run Analysis
        const gaps = await gapFinder.findGaps(graph)

        res.json({
            graphId,
            gaps,
            count: gaps.length
        })

    } catch (error) {
        logger.error('AnalysisAPI', 'Gap analysis failed', { error })
        res.status(500).json({ error: 'Gap analysis failed' })
    }
})

export default router
