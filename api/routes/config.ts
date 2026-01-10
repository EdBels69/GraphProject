
import express from 'express'
import { configService } from '../services/configService'

const router = express.Router()

// GET /api/config/ontology
router.get('/ontology', async (req: any, res) => {
    try {
        const userId = req.user.id
        const ontology = await configService.getOntology(userId)
        res.json(ontology)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ontology' })
    }
})

// POST /api/config/ontology
router.post('/ontology', async (req: any, res) => {
    try {
        const userId = req.user.id
        const config = req.body
        await configService.saveOntology(userId, config)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to save ontology' })
    }
})

// GET /api/config/prompts
router.get('/prompts', async (req: any, res) => {
    try {
        const userId = req.user.id
        const prompts = await configService.getPrompts(userId)
        res.json(prompts)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prompts' })
    }
})

// POST /api/config/prompts
router.post('/prompts', async (req: any, res) => {
    try {
        const userId = req.user.id
        const config = req.body
        await configService.savePrompts(userId, config)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to save prompts' })
    }
})

export default router
