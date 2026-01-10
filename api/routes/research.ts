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
router.post('/jobs', async (req: any, res) => {
    try {
        const userId = req.user.id
        const request: ResearchJobRequest = req.body

        if (!request.topic || typeof request.topic !== 'string') {
            return res.status(400).json({ error: 'Topic is required' })
        }

        const job = await literatureAgent.startJob(request, userId)

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
router.get('/jobs', async (req: any, res) => {
    try {
        const userId = req.user.id
        const jobs = literatureAgent.getAllJobs(userId)

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
router.get('/jobs/:id', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const job = literatureAgent.getJob(id, userId)

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
 * GET /api/research/jobs/:id/logs
 * Get live logs for a research job (Glass Box AI)
 */
router.get('/jobs/:id/logs', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        // Ownership check
        const job = literatureAgent.getJob(id, userId)
        if (!job) return res.status(404).json({ error: 'Job not found' })

        const logs = literatureAgent.getJobLogs(id)
        res.json(logs)
    } catch (error) {
        console.error('Error getting job logs:', error)
        res.status(500).json({ error: 'Failed to fetch logs' })
    }
})

/**
 * PATCH /api/research/jobs/:id/screening
 * Update screening decisions (include/exclude papers)
 */
router.patch('/jobs/:id/screening', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const { includedIds, excludedIds, exclusionReasons } = req.body

        if (!Array.isArray(includedIds) || !Array.isArray(excludedIds)) {
            return res.status(400).json({ error: 'includedIds and excludedIds must be arrays' })
        }

        const updatedJob = literatureAgent.updateScreening(id, {
            includedIds,
            excludedIds,
            exclusionReasons
        }, userId)

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
router.post('/jobs/:id/analyze', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const config = req.body

        // Trigger async analysis
        literatureAgent.analyzeJob(id, config, userId)

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
router.delete('/jobs/:id', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const deleted = await literatureAgent.deleteJob(id, userId)

        if (!deleted) {
            return res.status(404).json({ error: 'Job not found' })
        }

        res.json({
            id,
            status: 'deleted',
            message: 'Research job and files deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting research job:', error)
        res.status(500).json({ error: 'Failed to delete research job' })
    }
})

/**
 * GET /api/research/jobs/:id/entities
 * Get extracted entities preview for a job
 */
router.get('/jobs/:id/entities', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const job = literatureAgent.getJob(id, userId)

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
router.post('/jobs/:id/build-graph', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const { config } = req.body

        const job = literatureAgent.getJob(id, userId)

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
        const graphId = await literatureAgent.buildGraphFromJob(id, userId, config)

        res.json({
            graphId,
            message: 'Graph built successfully'
        })
    } catch (error) {
        console.error('Error building graph:', error)
        res.status(500).json({ error: 'Failed to build graph' })
    }
})

/**
 * GET /api/research/jobs/:id/export/csv
 * Export screening table as CSV
 */
router.get('/jobs/:id/export/csv', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const job = literatureAgent.getJob(id, userId)

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        const articles = job.articles || []

        // CSV header
        const headers = ['ID', 'Title', 'Authors', 'Year', 'DOI', 'Source', 'Status', 'Screening']
        const rows = articles.map(a => [
            a.id,
            `"${(a.title || '').replace(/"/g, '""')}"`,
            `"${(a.authors || []).join('; ').replace(/"/g, '""')}"`,
            a.year || '',
            a.doi || '',
            a.source || '',
            a.status || '',
            a.screeningStatus || 'pending'
        ])

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="screening-${id}.csv"`)
        res.send('\uFEFF' + csv) // BOM for Excel UTF-8
    } catch (error) {
        console.error('Error exporting CSV:', error)
        res.status(500).json({ error: 'Failed to export CSV' })
    }
})

/**
 * GET /api/research/jobs/:id/export/bibtex
 * Export included articles as BibTeX
 */
router.get('/jobs/:id/export/bibtex', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const job = literatureAgent.getJob(id, userId)

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        const articles = (job.articles || []).filter(a => a.screeningStatus === 'included')

        const entries = articles.map((a, idx) => {
            const key = a.doi ? a.doi.replace(/[^a-zA-Z0-9]/g, '_') : `article_${idx + 1}`
            const authors = (a.authors || []).join(' and ')
            return `@article{${key},
  title = {${a.title || 'Untitled'}},
  author = {${authors}},
  year = {${a.year || 'n.d.'}},
  doi = {${a.doi || ''}},
  url = {${a.url || ''}}
}`
        })

        const bibtex = entries.join('\n\n')

        res.setHeader('Content-Type', 'application/x-bibtex; charset=utf-8')
        res.setHeader('Content-Disposition', `attachment; filename="references-${id}.bib"`)
        res.send(bibtex)
    } catch (error) {
        console.error('Error exporting BibTeX:', error)
        res.status(500).json({ error: 'Failed to export BibTeX' })
    }
})

/**
 * GET /api/research/jobs/:id/export/parquet
 * Export screening table as Parquet format
 */
router.get('/jobs/:id/export/parquet', async (req: any, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id
        const job = literatureAgent.getJob(id, userId)

        if (!job) {
            return res.status(404).json({ error: 'Job not found' })
        }

        const articles = job.articles || []

        // Dynamic import parquetjs-lite
        const parquet = await import('parquetjs-lite')

        // Define schema
        const schema = new parquet.ParquetSchema({
            id: { type: 'UTF8' },
            title: { type: 'UTF8' },
            authors: { type: 'UTF8' },
            year: { type: 'INT32', optional: true },
            doi: { type: 'UTF8', optional: true },
            source: { type: 'UTF8' },
            abstract: { type: 'UTF8', optional: true },
            screeningStatus: { type: 'UTF8' }
        })

        // Create temp file path
        const tempPath = path.join('/tmp', `screening-${id}-${Date.now()}.parquet`)

        // Write parquet file
        const writer = await parquet.ParquetWriter.openFile(schema, tempPath)

        for (const article of articles) {
            await writer.appendRow({
                id: article.id || '',
                title: article.title || '',
                authors: (article.authors || []).join('; '),
                year: article.year || null,
                doi: article.doi || null,
                source: article.source || '',
                abstract: article.abstract || null,
                screeningStatus: article.screeningStatus || 'pending'
            })
        }

        await writer.close()

        // Send file
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename="screening-${id}.parquet"`)

        const fileStream = fs.createReadStream(tempPath)
        fileStream.pipe(res)

        // Cleanup temp file after sending
        fileStream.on('close', () => {
            fs.unlink(tempPath, () => { })
        })
    } catch (error) {
        console.error('Error exporting Parquet:', error)
        res.status(500).json({ error: 'Failed to export Parquet' })
    }
})

export default router
