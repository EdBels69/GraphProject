
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

// GET /api/config/ai
router.get('/ai', async (req: any, res) => {
    try {
        // Return current AI config (simplified for now)
        // ideally configService would return this
        res.json({
            provider: process.env.PRIMARY_AI_PROVIDER || 'local',
            models: ['glm-4', 'llama3', 'mistral', 'deepseek-chat']
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch AI config' })
    }
})

// POST /api/config/ai
router.post('/ai', async (req: any, res) => {
    try {
        // Here we would save to DB/Env
        // For now, just acknowledge 
        res.json({ success: true, message: 'AI configuration updated (not persisted in dev)' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to save AI config' })
    }
})

export default router
