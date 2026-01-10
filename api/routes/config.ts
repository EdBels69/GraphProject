
import express from 'express'
import { configService } from '../services/configService'

const router = express.Router()

// GET /api/config/ontology
router.get('/ontology', async (req, res) => {
    try {
        const ontology = await configService.getOntology()
        res.json(ontology)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ontology' })
    }
})

// POST /api/config/ontology
router.post('/ontology', async (req, res) => {
    try {
        const config = req.body
        await configService.saveOntology(config)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to save ontology' })
    }
})

// GET /api/config/prompts
router.get('/prompts', async (req, res) => {
    try {
        const prompts = await configService.getPrompts()
        res.json(prompts)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prompts' })
    }
})

// POST /api/config/prompts
router.post('/prompts', async (req, res) => {
    try {
        const config = req.body
        await configService.savePrompts(config)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Failed to save prompts' })
    }
})

export default router
