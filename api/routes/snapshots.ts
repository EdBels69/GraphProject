import express from 'express'
import { sessionManager } from '../services/SessionManager'
import { logger } from '../core/Logger'

const router = express.Router()

/**
 * POST /api/graphs/:id/snapshots
 * Create new snapshot
 */
router.post('/:id/snapshots', async (req: any, res) => {
    try {
        const { id } = req.params
        const { name } = req.body

        const snapshot = await sessionManager.saveSnapshot(id, name || 'Manual Snapshot')

        res.status(201).json(snapshot)
    } catch (error) {
        logger.error('SnapshotAPI', 'Failed to create snapshot', { error })
        res.status(500).json({ error: 'Failed to create snapshot' })
    }
})

/**
 * GET /api/graphs/:id/snapshots
 * List snapshots
 */
router.get('/:id/snapshots', async (req: any, res) => {
    try {
        const { id } = req.params
        const snapshots = await sessionManager.listSnapshots(id)
        res.json({ snapshots })
    } catch (error) {
        logger.error('SnapshotAPI', 'Failed to list snapshots', { error })
        res.status(500).json({ error: 'Failed to list snapshots' })
    }
})

/**
 * POST /api/graphs/:id/restore/:snapshotId
 * Restore snapshot
 */
router.post('/:id/restore/:snapshotId', async (req: any, res) => {
    try {
        const { snapshotId } = req.params
        const graph = await sessionManager.restoreSnapshot(snapshotId)
        res.json({ message: 'Graph restored', graph })
    } catch (error) {
        logger.error('SnapshotAPI', 'Failed to restore snapshot', { error })
        res.status(500).json({ error: 'Failed to restore snapshot' })
    }
})

export default router
