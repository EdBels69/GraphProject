/**
 * Research Routes - Literature Agent API
 */

import express from 'express'
import fs from 'fs'
import path from 'path'
import { literatureAgent } from '../services/literatureAgent'
import { ResearchJobRequest } from '../../shared/contracts/research'

const router = express.Router()

/**
 * POST /api/research/jobs
 * Start a new research job
 */
router.post('/jobs', async (req, res) => {
    try {
        const request: ResearchJobRequest = req.body

        if (!request.topic || typeof request.topic !== 'string') {
            return res.status(400).json({ error: 'Topic is required' })
        }

        const job = await literatureAgent.startJob(request)

        res.status(201).json({
            job,
            message: 'Research job started successfully'
        })
    } catch (error) {
        console.error('Error starting research job:', error)
        res.status(500).json({ error: 'Failed to start research job' })
    }
})

/**
 * GET /api/research/jobs
 * List all research jobs
 */
router.get('/jobs', async (req, res) => {
    try {
        const jobs = literatureAgent.getAllJobs()

        res.json({
            total: jobs.length,
            jobs: jobs.map(job => ({
                id: job.id,
                topic: job.topic,
                status: job.status,
                progress: job.progress,
                articlesFound: job.articlesFound,
                articlesProcessed: job.articlesProcessed,
                articles: job.articles, // Include articles for UI list
                graphId: job.graphId,   // Include graphId for navigation
                reviewText: job.reviewText,
                error: job.error,
                createdAt: job.createdAt,
                completedAt: job.completedAt
            }))
        })
    } catch (error) {
        console.error('Error listing research jobs:', error)
        res.status(500).json({ error: 'Failed to list research jobs' })
    }
})

/**
 * GET /api/research/jobs/:id
 * Get research job status
 */
router.get('/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params
        const job = literatureAgent.getJob(id)

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        res.json({ job })
    } catch (error) {
        console.error('Error getting research job:', error)
        res.status(500).json({ error: 'Failed to get research job' })
    }
})

/**
 * PATCH /api/research/jobs/:id/screening
 * Update screening decisions (include/exclude papers)
 */
router.patch('/jobs/:id/screening', async (req, res) => {
    try {
        const { id } = req.params
        const { includedIds, excludedIds, exclusionReasons } = req.body

        if (!Array.isArray(includedIds) || !Array.isArray(excludedIds)) {
            return res.status(400).json({ error: 'includedIds and excludedIds must be arrays' })
        }

        const updatedJob = literatureAgent.updateScreening(id, {
            includedIds,
            excludedIds,
            exclusionReasons
        })

        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found' })
        }

        res.json({ job: updatedJob })
    } catch (error) {
        console.error('Error updating screening:', error)
        res.status(500).json({ error: 'Failed to update screening' })
    }
})

/**
 * GET /api/research/schema
 * Get column schema for analysis configuration
 */
router.get('/schema', async (req, res) => {
    try {
        // We import it dynamically or read file
        const schemaPath = path.resolve(process.cwd(), 'shared/config/columnSchema.json')
        if (fs.existsSync(schemaPath)) {
            const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
            res.json(schema)
        } else {
            // Fallback
            const schema = require('../../shared/config/columnSchema.json')
            res.json(schema)
        }
    } catch (error) {
        console.error('Error getting schema:', error)
        res.status(500).json({ error: 'Failed to get schema' })
    }
})

/**
 * POST /api/research/jobs/:id/analyze
 * Trigger detailed analysis on selected papers
 */
router.post('/jobs/:id/analyze', async (req, res) => {
    try {
        const { id } = req.params
        const config = req.body

        // Trigger async analysis
        literatureAgent.analyzeJob(id, config)

        res.status(202).json({
            message: 'Analysis started',
            status: 'analyzing',
            jobId: id
        })
    } catch (error) {
        console.error('Error starting analysis:', error)
        res.status(500).json({ error: 'Failed to start analysis' })
    }
})

/**
 * DELETE /api/research/jobs/:id
 * Cancel a research job
 */
router.delete('/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params
        const cancelled = literatureAgent.cancelJob(id)

        if (!cancelled) {
            return res.status(404).json({ error: 'Job not found or cannot be cancelled' })
        }

        res.json({
            id,
            status: 'cancelled',
            message: 'Research job cancelled'
        })
    } catch (error) {
        console.error('Error cancelling research job:', error)
        res.status(500).json({ error: 'Failed to cancel research job' })
    }
})

/**
 * GET /api/research/jobs/:id/entities
 * Get extracted entities preview for a job
 */
router.get('/jobs/:id/entities', async (req, res) => {
    try {
        const { id } = req.params
        const job = literatureAgent.getJob(id)

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        // Get entities from the job's extraction results
        const entities = job.extractedEntities || []
        const relations = job.extractedRelations || []

        // Group entities by type for stats
        const entityStats: Record<string, number> = {}
        entities.forEach((e: any) => {
            const type = e.type || 'Concept'
            entityStats[type] = (entityStats[type] || 0) + 1
        })

        res.json({
            jobId: id,
            entityCount: entities.length,
            relationCount: relations.length,
            entityStats,
            entities: entities.slice(0, 100), // Preview first 100
            relations: relations.slice(0, 50)  // Preview first 50
        })
    } catch (error) {
        console.error('Error getting entities:', error)
        res.status(500).json({ error: 'Failed to get entities' })
    }
})

/**
 * POST /api/research/jobs/:id/build-graph
 * Build knowledge graph with specified configuration
 */
router.post('/jobs/:id/build-graph', async (req, res) => {
    try {
        const { id } = req.params
        const { config } = req.body

        const job = literatureAgent.getJob(id)

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        if (job.status !== 'completed') {
            return res.status(400).json({ error: 'Job must be completed before building graph' })
        }

        // If graph already exists, return it
        if (job.graphId) {
            return res.json({
                graphId: job.graphId,
                message: 'Graph already exists'
            })
        }

        // Build graph using literature agent
        const graphId = await literatureAgent.buildGraphFromJob(id, config)

        res.json({
            graphId,
            message: 'Graph built successfully'
        })
    } catch (error) {
        console.error('Error building graph:', error)
        res.status(500).json({ error: 'Failed to build graph' })
    }
})

export default router
