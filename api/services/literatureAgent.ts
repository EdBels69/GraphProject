/**
 * Literature Agent - Autonomous Research Orchestrator
 * 
 * Orchestrates the entire literature collection pipeline:
 * 1. Generate search queries from topic
 * 2. Search multiple sources (PubMed, CrossRef, arXiv)
 * 3. Find Open Access PDFs via Unpaywall
 * 4. Download and process articles
 * 5. Build knowledge graph
 * 6. Generate literature review
 */

import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { EventEmitter } from 'events'
import {
    ResearchJob,
    ResearchJobRequest,
    ResearchJobStatus,
    ArticleSource,
    ResearchSource
} from '../../shared/contracts/research'
import { chatCompletion } from './aiService'
import { logger } from '../core/Logger'
import { isFeatureEnabled } from '../../shared/config/features'
import { databaseManager } from '../core/Database'
import { jobLogger } from './jobLogger'
import { jobManager } from './jobs/JobManager'
import { searchOrchestrator } from './search/SearchOrchestrator'
import { analysisService } from './analysis/AnalysisService'
import { graphService } from './graph/GraphService'
import { entityExtractor } from './entityExtractor'
import globalSearch from './globalSearch'
import { columnExtractor } from './columnExtractor'
import GraphStorage from '../../shared/graphStorage'
import { knowledgeGraphBuilder } from './knowledgeGraphBuilder'
import { graphRepository } from '../repositories/GraphRepository'

export class LiteratureAgent extends EventEmitter {
    // jobLogs moved to JobLogger
    // jobs map delegated to JobManager

    constructor() {
        super()
    }

    /**
     * Initialize the agent
     */
    async initialize(): Promise<void> {
        await jobManager.initialize()
    }

    /**
     * Sync jobs from database to memory on startup
     * Delegated to JobManager
     */
    private async syncJobsWithDb(): Promise<void> {
        // No-op, logic moved to JobManager
    }

    /**
     * Start a new research job
     */
    async startJob(request: ResearchJobRequest, userId: string): Promise<ResearchJob> {
        logger.info('LiteratureAgent', `startJob received request:`, { topic: request.topic })
        const job = jobManager.createJob(request, userId)

        // Start processing in background
        this.processJob(job, request).catch(async (error) => {
            await jobManager.updateJobStatus(job.id, 'failed', error instanceof Error ? error.message : String(error))
            logger.error('LiteratureAgent', `Job ${job.id} failed`, { error })
        })

        return job
    }

    /**
     * Persist job to database
     */
    /**
     * Persist job to database - Delegated to JobManager
     */
    async persistJob(job: ResearchJob): Promise<void> {
        await jobManager.persistJob(job)
    }

    /**
     * Get job by ID - Delegated to JobManager
     */
    getJob(jobId: string, userId: string): ResearchJob | undefined {
        const job = jobManager.getJob(jobId)
        if (job && job.userId === userId) return job
        return undefined
    }

    /**
     * Get all jobs for a user - Delegated to JobManager
     */
    getAllJobs(userId: string): ResearchJob[] {
        return jobManager.getAllJobs(userId)
    }

    /**
     * Cancel a job
     */
    cancelJob(jobId: string): boolean {
        const job = jobManager.getJob(jobId)
        if (!job || job.status === 'completed' || job.status === 'failed') {
            return false
        }

        job.status = 'cancelled'
        job.updatedAt = new Date().toISOString()
        jobManager.persistJob(job) // Persist cancelled state
        return true
    }

    /**
     * Delete a job - Delegated to JobManager
     */
    async deleteJob(jobId: string, userId: string): Promise<boolean> {
        return await jobManager.deleteJob(jobId, userId)
    }

    /**
     * Update screening decisions for a job
     */
    async updateScreening(jobId: string, updates: {
        includedIds: string[],
        excludedIds: string[],
        exclusionReasons?: Record<string, string>
    }, userId: string): Promise<ResearchJob | null> {
        const job = jobManager.getJob(jobId)
        if (!job || job.userId !== userId) return null

        job.includedIds = updates.includedIds
        job.excludedIds = updates.excludedIds
        if (updates.exclusionReasons) {
            job.exclusionReasons = updates.exclusionReasons
        }

        // Update article statuses
        if (job.articles) {
            job.articles.forEach(article => {
                if (updates.includedIds.includes(article.id)) {
                    article.screeningStatus = 'included'
                } else if (updates.excludedIds.includes(article.id)) {
                    article.screeningStatus = 'excluded'
                } else {
                    article.screeningStatus = 'pending' // Reset if not in either list
                }
            })
        }

        job.updatedAt = new Date().toISOString()
        await this.persistJob(job) // CRITICAL: Save screening data to DB
        return job
    }

    /**
     * Run detailed analysis on selected papers
     */
    async analyzeJob(jobId: string, config: {
        extractEntities: boolean
        extractRelations: boolean
        extractColumns: boolean
        domain?: string
        columns?: string[]
    }, userId: string): Promise<ResearchJob> {
        const job = jobManager.getJob(jobId)
        if (!job || job.userId !== userId) throw new Error('Job not found')

        job.status = 'analyzing'
        job.progress = 0
        job.updatedAt = new Date().toISOString()

        const includedIds = job.includedIds || []
        const articlesToAnalyze = (job.articles || []).filter(a => includedIds.includes(a.id))

        if (articlesToAnalyze.length === 0) {
            job.status = 'completed'
            job.progress = 100
            this.emit('job:completed', job)
            return job
        }

        try {
            // 1. Column Extraction
            if (config.extractColumns) {
                let processed = 0
                for (const article of articlesToAnalyze) {
                    try {
                        const data = await columnExtractor.extractData(article, config.domain || 'all', globalSearch, config.columns)
                        article.extractedData = data
                    } catch (e) {
                        logger.error('LiteratureAgent', `Failed to extract columns for ${article.title}`, { error: e })
                    }
                    processed++
                    job.progress = Math.floor((processed / articlesToAnalyze.length) * 40)
                    job.updatedAt = new Date().toISOString()
                }
            }



            // 2. Entity Extraction
            if (config.extractEntities) {
                const allEntities: any[] = []
                const allRelations: any[] = []
                let processed = 0

                this.log(jobId, 'ai', `Starting entity extraction for ${articlesToAnalyze.length} articles...`)

                for (const article of articlesToAnalyze) {
                    // Cast to any to avoid narrowing error where TypeScript thinks status can only be 'analyzing'
                    if ((job as any).status === 'cancelled') break

                    try {
                        this.log(jobId, 'ai', `Extracting from: ${article.title.substring(0, 50)}...`)
                        const { entities, relations } = await analysisService.processArticle(article, job.topic)
                        if (entities.length > 0) {
                            allEntities.push(...entities)
                            allRelations.push(...relations)
                            this.log(jobId, 'success', `  -> Extracted ${entities.length} entities, ${relations.length} relations`)
                        }
                    } catch (e) {
                        logger.error('LiteratureAgent', `Failed to extract entities for ${article.title}`, { error: e })
                        this.log(jobId, 'error', `Failed to extract from ${article.title}`)
                    }
                    processed++
                    job.progress = 40 + Math.floor((processed / articlesToAnalyze.length) * 50)
                    job.updatedAt = new Date().toISOString()
                }

                const mergedEntities = entityExtractor.mergeEntities(allEntities)
                job.extractedEntities = mergedEntities
                job.extractedRelations = allRelations

                this.log(jobId, 'success', `Total unique entities merged: ${mergedEntities.length}`)

                // Build graph
                try {
                    this.log(jobId, 'info', 'Building initial knowledge graph...')
                    const graphRes = await knowledgeGraphBuilder.buildGraph(mergedEntities, allRelations, {
                        minConfidence: 0.3,
                        includeCooccurrence: true
                    })

                    // Save graph to database and storage
                    await databaseManager.saveGraphToDb(graphRes.graph as any)
                    GraphStorage.save(graphRes.graph as any)

                    job.graphId = graphRes.graph.id
                    this.log(jobId, 'success', `Graph built and saved successfully: ${graphRes.graph.id}`)
                } catch (e) {
                    logger.error('LiteratureAgent', `Failed to build graph`, { error: e })
                    this.log(jobId, 'error', 'Failed to build graph')
                }
            }

            job.status = 'completed'
            job.progress = 100
            job.completedAt = new Date().toISOString()

            await this.persistJob(job) // Final persistence
            this.emit('job:completed', job)

            return job
        } catch (error) {
            job.status = 'failed'
            job.error = error instanceof Error ? error.message : String(error)
            this.emit('job:failed', job)
            return job
        }
    }

    /**
     * Build graph from job with user configuration
     */
    async buildGraphFromJob(jobId: string, userId: string, config?: any): Promise<string> {
        const job = jobManager.getJob(jobId)
        if (!job || job.userId !== userId) {
            throw new Error('Job not found')
        }

        if (job.status !== 'completed') {
            throw new Error('Job must be completed before building graph')
        }

        if (job.graphId) {
            return job.graphId // Already built
        }

        const entities = job.extractedEntities || []
        const relations = job.extractedRelations || []

        if (entities.length === 0) {
            throw new Error('No entities extracted from this job')
        }

        // Apply config filters if provided
        let filteredEntities = entities
        let filteredRelations = relations

        if (config?.nodeTypes) {
            const enabledTypes = Object.entries(config.nodeTypes)
                .filter(([_, enabled]) => enabled)
                .map(([type]) => type.toLowerCase())

            filteredEntities = entities.filter((e: any) => {
                const type = (e.type || 'concept').toLowerCase()
                return enabledTypes.includes(type) || enabledTypes.includes('concept')
            })
        }

        if (config?.minConfidence) {
            filteredEntities = filteredEntities.filter((e: any) =>
                (e.confidence || 0.5) >= config.minConfidence
            )
        }

        // Build graph with filtered data
        const graphRes = await knowledgeGraphBuilder.buildGraph(filteredEntities, filteredRelations, {
            minConfidence: config?.edgeMinConfidence || 0.3,
            includeCooccurrence: config?.edgeMethod !== 'ai'
        })
        const graph = graphRes.graph

        // Save graph
        await databaseManager.saveGraphToDb(graph as any)
        GraphStorage.save(graph as any)

        job.graphId = graph.id
        job.updatedAt = new Date().toISOString()

        logger.info('LiteratureAgent', `Built graph ${graph.id} with ${graph.nodes.length} nodes, ${graph.edges.length} edges`)

        return graph.id
    }

    /**
     * Main processing pipeline
     */
    private async processJob(job: ResearchJob, request: ResearchJobRequest): Promise<void> {
        try {
            // Step 1: Execute Search
            const articles = await this.executeSearchPhase(job, request)
            if (articles.length === 0) {
                this.finalizeJob(job, request, [], [], articles) // Empty
                return
            }

            // Research Mode: Stop after search
            if (job.mode === 'research') {
                await this.finalizeResearchMode(job, articles)
                return
            }

            // Step 3: Find PDFs
            // In quick mode, limit to top 5 articles to prevent overload
            let articlesToProcess = articles
            if (job.mode === 'quick' && articles.length > 5) {
                logger.info('LiteratureAgent', `Quick mode: Limit analysis to top 5 out of ${articles.length} articles`)
                articlesToProcess = articles.slice(0, 5)
            }

            const articlesWithPdf = await this.executePdfDiscoveryPhase(job, articlesToProcess)

            // Step 4: Download & Analyze
            const { entities, relations } = await this.executeAnalysisPhase(job, articlesWithPdf, request)

            // Step 5: Finalize
            await this.finalizeJob(job, request, entities, relations, articles)

        } catch (error) {
            this.handleJobError(job, error)
        }
    }

    private async executeSearchPhase(job: ResearchJob, request: ResearchJobRequest): Promise<ArticleSource[]> {
        return await searchOrchestrator.executeSearchPhase(job, request)
    }

    private async finalizeResearchMode(job: ResearchJob, articles: ArticleSource[]): Promise<void> {
        job.articles = articles.map(a => ({ ...a, screeningStatus: 'pending' as const }))
        job.status = 'completed'
        job.progress = 100
        job.completedAt = new Date().toISOString()
        job.updatedAt = new Date().toISOString()

        this.emit('job:completed', job)
        logger.info('LiteratureAgent', `Research job ${job.id} completed - ${articles.length} articles ready for screening`)
    }

    private async executePdfDiscoveryPhase(job: ResearchJob, articles: ArticleSource[]): Promise<ArticleSource[]> {
        return await analysisService.executePdfDiscoveryPhase(job, articles)
    }

    private async executeAnalysisPhase(job: ResearchJob, articles: ArticleSource[], request: ResearchJobRequest): Promise<{ entities: any[], relations: any[] }> {
        return await analysisService.executeAnalysisPhase(job, articles, request)
    }

    private async finalizeJob(
        job: ResearchJob,
        request: ResearchJobRequest,
        entities: any[],
        relations: any[],
        articles: ArticleSource[]
    ): Promise<void> {
        this.updateJob(job, 'analyzing', 95)

        // Delegate Graph Logic
        await graphService.finalizeGraphForJob(job, entities, relations)

        if (request.generateReview && isFeatureEnabled('USE_AI_FEATURES')) {
            const reviewText = await analysisService.generateReview(request.topic, entities, articles)
            job.reviewText = reviewText
        }

        // Old logic disabled/skipped
        const mergedEntities: any[] = [] // this.entityExtractor.mergeEntities(entities)
        job.extractedEntities = mergedEntities
        job.extractedRelations = relations

        logger.info('LiteratureAgent', `Extracted ${mergedEntities.length} entities from ${job.articlesProcessed} articles`)

        if (request.generateReview && isFeatureEnabled('USE_AI_FEATURES')) {
            const reviewText = await analysisService.generateReview(request.topic, entities, articles)
            job.reviewText = reviewText
        }

        // NEW: Build knowledge graph if entities exist - missing in automatic/quick flow
        if (mergedEntities.length > 0) {
            try {
                logger.info('LiteratureAgent', `Building auto-graph for job ${job.id}`)
                const graphRes = await knowledgeGraphBuilder.buildGraph(mergedEntities, relations, {
                    minConfidence: 0.3,
                    includeCooccurrence: true
                })

                    // Associate with the user who started the job
                    ; (graphRes.graph as any).userId = job.userId

                await databaseManager.saveGraphToDb(graphRes.graph as any)
                GraphStorage.save(graphRes.graph as any)
                job.graphId = graphRes.graph.id
                logger.info('LiteratureAgent', `Auto-graph built: ${job.graphId} for user ${job.userId}`)
            } catch (e) {
                logger.error('LiteratureAgent', `Failed to build auto-graph for job ${job.id}`, { error: e })
            }
        } else {
            logger.warn('LiteratureAgent', `No entities found for job ${job.id}, skipping graph building`)
        }

        job.status = 'completed'
        job.progress = 100
        job.completedAt = new Date().toISOString()
        job.updatedAt = new Date().toISOString()

        await this.persistJob(job) // CRITICAL: Save final state with graphId
        this.emit('job:completed', job)
    }

    private handleJobError(job: ResearchJob, error: unknown): void {
        job.status = 'failed'
        job.error = error instanceof Error ? error.message : String(error)
        job.updatedAt = new Date().toISOString()
        this.emit('job:failed', job)
        // Note: throw error was present, but usually we don't want to crash the process, just log.
        // However, if the caller expects a promise rejection, we might need to throw or return rejected promise.
        // The original method caught errors and re-threw them.
        // But since this is async void intended to run in background, throwing is fine if caught or unhandled rejection handled.
        // I will log it here.
        logger.error('LiteratureAgent', `Job ${job.id} failed`, { error })
    }





    /**
     * Update job status
     */
    private updateJob(job: ResearchJob, status: ResearchJobStatus, progress: number): void {
        job.status = status
        job.progress = progress
        job.updatedAt = new Date().toISOString()
        this.persistJob(job)
        this.emit('job:progress', job)
    }

    /**
     * Log an event for a job
     */
    private log(jobId: string, type: 'info' | 'search' | 'ai' | 'error' | 'success', message: string): void {
        jobLogger.log(jobId, type, message)
    }

    /**
     * Get logs for a job
     */
    getJobLogs(jobId: string): Array<{ timestamp: string; type: string; message: string }> {
        return jobLogger.getLogs(jobId)
    }
}

export const literatureAgent = new LiteratureAgent()
export default LiteratureAgent
