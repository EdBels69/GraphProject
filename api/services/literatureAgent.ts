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
import {
    IGlobalSearch,
    IUnpaywallService,
    IDocumentParser,
    IChunkingEngine,
    IEntityExtractor,
    IRelationExtractor,
    IKnowledgeGraphBuilder
} from './interfaces'
import { chatCompletion, summarizeDocument } from './aiService'
import { logger } from '../../src/core/Logger'
import { isFeatureEnabled } from '../../shared/config/features'
import axios from 'axios'
import { databaseManager } from '../../src/core/Database'
import GraphStorage from '../../shared/graphStorage'
import { fileStorage } from './fileStorage'
import { columnExtractor } from './columnExtractor'

export class LiteratureAgent extends EventEmitter {
    private jobs: Map<string, ResearchJob> = new Map()
    private globalSearch: IGlobalSearch
    private unpaywall: IUnpaywallService
    private documentParser: IDocumentParser
    private chunkingEngine: IChunkingEngine
    private entityExtractor: IEntityExtractor
    private relationExtractor: IRelationExtractor
    private graphBuilder: IKnowledgeGraphBuilder

    constructor(
        dependencies: {
            globalSearch: IGlobalSearch,
            unpaywall: IUnpaywallService,
            documentParser: IDocumentParser,
            chunkingEngine: IChunkingEngine,
            entityExtractor: IEntityExtractor,
            relationExtractor: IRelationExtractor,
            graphBuilder: IKnowledgeGraphBuilder
        }
    ) {
        super()
        this.globalSearch = dependencies.globalSearch
        this.unpaywall = dependencies.unpaywall
        this.documentParser = dependencies.documentParser
        this.chunkingEngine = dependencies.chunkingEngine
        this.entityExtractor = dependencies.entityExtractor
        this.relationExtractor = dependencies.relationExtractor
        this.graphBuilder = dependencies.graphBuilder
    }

    /**
     * Start a new research job
     */
    async startJob(request: ResearchJobRequest): Promise<ResearchJob> {
        const jobId = `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const job: ResearchJob = {
            id: jobId,
            topic: request.topic,
            mode: request.mode || 'research',  // Default to research mode
            status: 'pending',
            progress: 0,
            queries: [],
            articlesFound: 0,
            articlesProcessed: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        this.jobs.set(jobId, job)

        // Start processing in background
        this.processJob(job, request).catch(error => {
            job.status = 'failed'
            job.error = error instanceof Error ? error.message : String(error)
            job.updatedAt = new Date().toISOString()
            logger.error('LiteratureAgent', `Job ${jobId} failed`, { error })
            this.persistJob(job) // Persist failed state
        })

        return job
    }

    /**
     * Persist job to database
     */
    private async persistJob(job: ResearchJob): Promise<void> {
        try {
            await databaseManager.saveResearchJob({
                id: job.id,
                topic: job.topic,
                mode: job.mode || 'research',
                status: job.status,
                articlesFound: job.articlesFound || 0,
                progress: job.progress || 0,
                graphId: job.graphId,
                error: job.error,
                articles: job.articles || [],
                createdAt: new Date(job.createdAt || Date.now()),
                updatedAt: new Date(job.updatedAt || Date.now())
            })

            // Also persist articles
            if (job.articles && job.articles.length > 0) {
                await databaseManager.saveJobArticles(job.id, job.articles)
            }
        } catch (e) {
            logger.warn('LiteratureAgent', `Failed to persist job ${job.id}`, { error: e })
        }
    }

    /**
     * Get job by ID
     */
    getJob(jobId: string): ResearchJob | undefined {
        // First check in-memory cache
        const cached = this.jobs.get(jobId)
        if (cached) return cached

        // Job not in cache - will be loaded on next sync
        return undefined
    }

    /**
     * Get all jobs (from in-memory cache; DB is synced on startup)
     */
    getAllJobs(): ResearchJob[] {
        return Array.from(this.jobs.values())
    }

    /**
     * Cancel a job
     */
    /**
     * Cancel a job
     */
    cancelJob(jobId: string): boolean {
        const job = this.jobs.get(jobId)
        if (!job || job.status === 'completed' || job.status === 'failed') {
            return false
        }

        job.status = 'cancelled'
        job.updatedAt = new Date().toISOString()
        this.persistJob(job) // Persist cancelled state
        return true
    }

    /**
     * Delete a job permanently (DB + Files)
     */
    async deleteJob(jobId: string): Promise<boolean> {
        const job = this.jobs.get(jobId)

        // 1. Cancel if running
        const activeStatuses: ResearchJobStatus[] = ['searching', 'downloading', 'analyzing']
        // @ts-ignore
        if (job && activeStatuses.includes(job.status)) {
            this.cancelJob(jobId)
        }

        // 2. Delete from DB
        const deleted = await databaseManager.deleteResearchJob(jobId)
        if (!deleted && !job) return false // Not found anywhere

        // 3. Remove files
        try {
            const jobDir = path.join(process.cwd(), 'downloads', jobId)
            if (fs.existsSync(jobDir)) {
                fs.rmSync(jobDir, { recursive: true, force: true })
            }
        } catch (e) {
            logger.warn('LiteratureAgent', `Failed to delete files for job ${jobId}`, { error: e })
        }

        // 4. Remove from memory
        this.jobs.delete(jobId)

        return true
    }

    /**
     * Update screening decisions for a job
     */
    updateScreening(jobId: string, updates: {
        includedIds: string[],
        excludedIds: string[],
        exclusionReasons?: Record<string, string>
    }): ResearchJob | null {
        const job = this.jobs.get(jobId)
        if (!job) return null

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
    }): Promise<ResearchJob> {
        const job = this.jobs.get(jobId)
        if (!job) throw new Error('Job not found')

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
                        const data = await columnExtractor.extractData(article, config.domain || 'all', this.globalSearch)
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

                for (const article of articlesToAnalyze) {
                    // Cast to any to avoid narrowing error where TypeScript thinks status can only be 'analyzing'
                    if ((job as any).status === 'cancelled') break

                    try {
                        const { entities, relations } = await this.processArticle(article, job.topic)
                        if (entities.length > 0) {
                            allEntities.push(...entities)
                            allRelations.push(...relations)
                        }
                    } catch (e) {
                        logger.error('LiteratureAgent', `Failed to extract entities for ${article.title}`, { error: e })
                    }
                    processed++
                    job.progress = 40 + Math.floor((processed / articlesToAnalyze.length) * 50)
                    job.updatedAt = new Date().toISOString()
                }

                const mergedEntities = this.entityExtractor.mergeEntities(allEntities)
                job.extractedEntities = mergedEntities
                job.extractedRelations = allRelations

                // Build graph
                try {
                    const graphRes = await this.graphBuilder.buildGraph(mergedEntities, allRelations, {
                        minConfidence: 0.3,
                        includeCooccurrence: true
                    })
                    job.graphId = graphRes.graph.id
                } catch (e) {
                    logger.error('LiteratureAgent', `Failed to build graph`, { error: e })
                }
            }

            job.status = 'completed'
            job.progress = 100
            job.completedAt = new Date().toISOString()
            this.emit('job:completed', job)

        } catch (error) {
            job.status = 'failed'
            job.error = error instanceof Error ? error.message : String(error)
            this.emit('job:failed', job)
        }

        return job
    }

    /**
     * Build graph from job with user configuration
     */
    async buildGraphFromJob(jobId: string, config?: any): Promise<string> {
        const job = this.jobs.get(jobId)
        if (!job) {
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
        const graphRes = await this.graphBuilder.buildGraph(filteredEntities, filteredRelations, {
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
        const maxArticles = request.maxArticles || 20
        const sources = request.sources || ['pubmed', 'crossref']

        try {
            // Step 1: Generate search queries
            this.updateJob(job, 'searching', 5)
            job.queries = await this.generateQueries(request.topic)
            logger.info('LiteratureAgent', `Generated ${job.queries.length} queries for "${request.topic}"`)

            // Step 2: Search sources
            this.updateJob(job, 'searching', 15)
            const articles = await this.searchSources(job.queries, sources, maxArticles, request.yearFrom, request.yearTo)
            job.articlesFound = articles.length
            job.articles = articles
            logger.info('LiteratureAgent', `Found ${articles.length} articles`)

            if (articles.length === 0) {
                job.status = 'completed'
                job.progress = 100
                job.updatedAt = new Date().toISOString()
                return
            }

            // ===== RESEARCH MODE: Skip auto-analysis, just return articles for screening =====
            if (job.mode === 'research') {
                // Mark all articles as pending screening
                job.articles = articles.map(a => ({ ...a, screeningStatus: 'pending' as const }))
                job.status = 'completed'
                job.progress = 100
                job.completedAt = new Date().toISOString()
                job.updatedAt = new Date().toISOString()

                this.emit('job:completed', job)
                logger.info('LiteratureAgent', `Research job ${job.id} completed - ${articles.length} articles ready for screening`)
                return
            }

            // ===== QUICK MODE: Continue with auto-analysis =====
            // Step 3: Find Open Access PDFs
            this.updateJob(job, 'downloading', 30)
            const articlesWithPdf = await this.findOpenAccessPdfs(articles)
            const downloadable = articlesWithPdf.filter(a => a.pdfUrl)
            logger.info('LiteratureAgent', `Found ${downloadable.length} Open Access PDFs`)

            // Step 4: Download and process
            this.updateJob(job, 'analyzing', 50)
            const allEntities: any[] = []
            const allRelations: any[] = []

            // Filter for downloadable OR having abstract OR just title (fallback)
            const processable = articlesWithPdf.filter(a => a.pdfUrl || a.abstract || a.title)
            logger.info('LiteratureAgent', `Processing ${processable.length} articles out of ${articles.length} found`)

            for (let i = 0; i < Math.min(processable.length, maxArticles); i++) {
                const article = processable[i]

                if (job.status === 'cancelled') {
                    return
                }

                try {
                    const { entities, relations } = await this.processArticle(article, job.topic)
                    logger.info('LiteratureAgent', `Article "${article.title}" yielded ${entities.length} entities and ${relations.length} relations`)

                    if (entities.length > 0) {
                        allEntities.push(...entities)
                        allRelations.push(...relations)
                    } else {
                        logger.warn('LiteratureAgent', `No entities found in article: ${article.title}`)
                    }

                    job.articlesProcessed++



                    const progress = 50 + Math.floor((i / processable.length) * 40)
                    this.updateJob(job, 'analyzing', progress)
                } catch (error) {
                    logger.warn('LiteratureAgent', `Failed to process article: ${article.title}`, { error })
                }
            }


            // Step 5: Store entities and relations for preview (NO auto-build)
            this.updateJob(job, 'analyzing', 95)

            // Merge entities from all articles
            const mergedEntities = this.entityExtractor.mergeEntities(allEntities)

            // Store for later graph building with user config
            job.extractedEntities = mergedEntities
            job.extractedRelations = allRelations

            logger.info('LiteratureAgent', `Extracted ${mergedEntities.length} entities and ${allRelations.length} relations from ${job.articlesProcessed} articles`)

            // Step 6: Generate review (optional)
            if (request.generateReview && isFeatureEnabled('USE_AI_FEATURES')) {
                const reviewText = await this.generateReview(request.topic, allEntities, articles)
                job.reviewText = reviewText
            }

            // Complete - but NO graphId yet (user will configure and build)
            job.status = 'completed'
            job.progress = 100
            job.completedAt = new Date().toISOString()
            job.updatedAt = new Date().toISOString()

            this.emit('job:completed', job)
            logger.info('LiteratureAgent', `Job ${job.id} completed - awaiting graph configuration`)

        } catch (error) {
            job.status = 'failed'
            job.error = error instanceof Error ? error.message : String(error)
            job.updatedAt = new Date().toISOString()
            this.emit('job:failed', job)
            throw error
        }
    }

    /**
     * Generate search queries from topic using AI
     * Always includes original topic first, then AI-generated variations
     */
    private async generateQueries(topic: string): Promise<string[]> {
        // Always start with the original topic - most reliable
        const queries: string[] = [topic]

        if (!isFeatureEnabled('USE_AI_FEATURES')) {
            return queries
        }

        try {
            const response = await chatCompletion([
                {
                    role: 'system',
                    content: `You are a biomedical search assistant. Given a research topic, generate 3 simple search query variations for PubMed.
Rules:
- Keep queries SHORT (2-4 words max)
- Use common biomedical terms
- Do NOT add complex operators or boolean logic
- Focus on synonyms and related concepts
Return ONLY a JSON array of 3 strings.`
                },
                {
                    role: 'user',
                    content: `Topic: "${topic}"
Generate 3 simple search query variations:`
                }
            ], { temperature: 0.3 }) // Lower temperature for more focused results

            const cleaned = response.content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
            const aiQueries = JSON.parse(cleaned)

            if (Array.isArray(aiQueries)) {
                // Add AI queries but keep them simple
                for (const q of aiQueries.slice(0, 3)) {
                    if (typeof q === 'string' && q.length > 2 && !queries.includes(q)) {
                        queries.push(q)
                    }
                }
            }

            logger.info('LiteratureAgent', `Generated ${queries.length} search queries`, { queries })
            return queries
        } catch (error) {
            logger.warn('LiteratureAgent', 'Failed to generate queries with AI, using topic only', { error })
            return queries
        }
    }

    /**
     * Search multiple sources with fallback to broader search
     */
    private async searchSources(
        queries: string[],
        sources: ResearchSource[],
        maxResults: number,
        yearFrom?: number,
        yearTo?: number
    ): Promise<ArticleSource[]> {
        const allArticles: ArticleSource[] = []
        const seenDois = new Set<string>()

        const addResults = (results: any[]) => {
            for (const result of results) {
                if (result.doi && seenDois.has(result.doi)) continue
                if (result.doi) seenDois.add(result.doi)

                allArticles.push({
                    id: result.id,
                    doi: result.doi,
                    title: result.title,
                    authors: result.authors,
                    year: result.year,
                    abstract: result.abstract,
                    url: result.url,
                    source: result.source as ResearchSource,
                    status: 'pending'
                })
            }
        }

        // Try each query
        for (const query of queries.slice(0, 4)) {
            if (allArticles.length >= maxResults) break

            try {
                logger.info('LiteratureAgent', `Searching: "${query}"`)
                const results = await this.globalSearch.search({
                    query,
                    sources,
                    maxResults: Math.ceil(maxResults / 2), // Get more per query for better coverage
                    yearFrom,
                    yearTo
                })
                addResults(results.results)
                logger.info('LiteratureAgent', `Query "${query}" returned ${results.results.length} results`)
            } catch (error) {
                logger.warn('LiteratureAgent', `Search failed for query: ${query}`, { error })
            }
        }

        // FALLBACK: If still no results, try broader search without year limits
        if (allArticles.length === 0 && queries.length > 0) {
            logger.info('LiteratureAgent', 'No results found, trying broader search without year limits...')

            // Try just the main keyword(s)
            const mainTopic = queries[0].split(' ').slice(0, 2).join(' ')

            try {
                const results = await this.globalSearch.search({
                    query: mainTopic,
                    sources,
                    maxResults: maxResults,
                    // No year limits for fallback
                })
                addResults(results.results)
                logger.info('LiteratureAgent', `Fallback search "${mainTopic}" returned ${results.results.length} results`)
            } catch (error) {
                logger.warn('LiteratureAgent', `Fallback search failed`, { error })
            }
        }

        logger.info('LiteratureAgent', `Total unique articles found: ${allArticles.length}`)
        return allArticles.slice(0, maxResults)
    }

    /**
     * Find Open Access PDFs via Unpaywall
     */
    private async findOpenAccessPdfs(articles: ArticleSource[]): Promise<ArticleSource[]> {
        const articlesWithDoi = articles.filter(a => a.doi)
        const dois = articlesWithDoi.map(a => a.doi!)

        const oaResults = await this.unpaywall.batchFindPdfs(dois)

        for (const article of articlesWithDoi) {
            const oaResult = oaResults.get(article.doi!)
            if (oaResult?.pdfUrl) {
                article.pdfUrl = oaResult.pdfUrl
            }
        }

        return articles
    }

    /**
     * Process a single article
     */
    private async processArticle(article: ArticleSource, topic: string): Promise<{
        entities: any[]
        relations: any[]
    }> {
        if (!article.pdfUrl) {
            // Use abstract if available, otherwise fallback to title
            const content = article.abstract || article.title

            if (content) {
                // If using only title, we treat it as a short abstract
                const chunks = await this.chunkingEngine.chunkText(content, article.id)
                const extracted = await this.entityExtractor.extractFromChunks(chunks)
                const relations = await this.relationExtractor.extractRelations(
                    content,
                    extracted.entities,
                    article.id
                )
                article.status = 'processed'

                // If we only had a title, mark it in entities source
                if (!article.abstract) {
                    extracted.entities.forEach(e => e.source = 'Title Only')
                }

                return { entities: extracted.entities, relations: relations.relations }
            }
            return { entities: [], relations: [] }
        }

        try {
            // Download PDF
            const response = await axios.get(article.pdfUrl, {
                responseType: 'arraybuffer',
                timeout: 30000
            })
            const buffer = Buffer.from(response.data)

            // Save to local storage with human-readable naming
            // Folder: 2026-01-09_topic_name
            // File: 2024_Smith_proteomics.pdf
            try {
                await fileStorage.savePDF(topic, {
                    year: article.year,
                    authors: article.authors,
                    title: article.title,
                    keywords: article.keywords
                }, buffer)
            } catch (err) {
                logger.warn('LiteratureAgent', `Failed to save PDF locally: ${article.id}`, { error: err })
            }

            // Parse PDF
            const parsed = await this.documentParser.parsePDF(buffer, article.title)

            // Process
            const chunks = await this.chunkingEngine.chunkText(parsed.content, article.id)
            const extracted = await this.entityExtractor.extractFromChunks(chunks)
            const relations = await this.relationExtractor.extractRelations(
                parsed.content,
                extracted.entities,
                article.id
            )

            article.status = 'processed'
            return { entities: extracted.entities, relations: relations.relations }
        } catch (error) {
            article.status = 'failed'
            article.error = error instanceof Error ? error.message : String(error)
            throw error
        }
    }

    /**
     * Generate literature review
     */
    private async generateReview(
        topic: string,
        entities: any[],
        articles: ArticleSource[]
    ): Promise<string> {
        const topEntities = entities
            .sort((a, b) => (b.mentions || 0) - (a.mentions || 0))
            .slice(0, 20)
            .map(e => e.name)
            .join(', ')

        const articleTitles = articles
            .slice(0, 10)
            .map(a => a.title)
            .join('\n- ')

        try {
            const response = await chatCompletion([
                {
                    role: 'system',
                    content: `You are a scientific writer. Generate a brief literature review (2-3 paragraphs) based on the provided data.`
                },
                {
                    role: 'user',
                    content: `Topic: ${topic}\n\nKey entities found: ${topEntities}\n\nArticle titles:\n- ${articleTitles}\n\nGenerate a literature review summarizing what is known about this topic.`
                }
            ], { temperature: 0.7, maxTokens: 1500 })

            return response.content
        } catch (error) {
            logger.warn('LiteratureAgent', 'Failed to generate review')
            return 'Literature review generation failed.'
        }
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
}

import { GlobalSearch } from './globalSearch'
import { UnpaywallService } from './unpaywallService'
import { DocumentParser } from './documentParser'
import { ChunkingEngine } from './chunkingEngine'
import { EntityExtractor } from './entityExtractor'
import { RelationExtractor } from './relationExtractor'
import { KnowledgeGraphBuilder } from './knowledgeGraphBuilder'

export const literatureAgent = new LiteratureAgent({
    globalSearch: new GlobalSearch() as any,
    unpaywall: new UnpaywallService() as any,
    documentParser: new DocumentParser() as any,
    chunkingEngine: new ChunkingEngine() as any,
    entityExtractor: new EntityExtractor() as any,
    relationExtractor: new RelationExtractor() as any,
    graphBuilder: new KnowledgeGraphBuilder() as any
})
export default LiteratureAgent
