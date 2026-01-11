
import axios from 'axios'
import { ResearchJob, ResearchJobRequest } from '../../../shared/contracts/research'
import { logger } from '../../core/Logger'
import { jobManager } from '../jobs/JobManager'
import { unpaywallService } from '../unpaywallService'
import documentParser from '../documentParser'
import chunkingEngine from '../chunkingEngine'
import { entityExtractor } from '../entityExtractor'
import { relationExtractor } from '../relationExtractor'
import { fileStorage } from '../fileStorage'
import GraphStorage from '../../../shared/graphStorage'
import { chatCompletion } from '../aiService'
import { isFeatureEnabled } from '../../../shared/config/features'

export class AnalysisService {

    /**
     * Execute PDF Discovery Phase
     */
    async executePdfDiscoveryPhase(job: ResearchJob, articles: ArticleSource[]): Promise<ArticleSource[]> {
        await jobManager.updateJobStatus(job.id, 'downloading', 'Finding Open Access PDFs...')
        await jobManager.updateProgress(job.id, 30)

        const articlesWithPdf = await this.findOpenAccessPdfs(articles)
        const downloadable = articlesWithPdf.filter(a => a.pdfUrl)
        jobManager.log(job.id, 'info', `Found ${downloadable.length} Open Access PDFs`)

        // Update job with found PDFs info
        job.articles = articlesWithPdf
        await jobManager.persistJob(job)

        return articlesWithPdf
    }

    /**
     * Execute Analysis Phase
     */
    async executeAnalysisPhase(job: ResearchJob, articles: ArticleSource[], request: ResearchJobRequest): Promise<{ entities: any[], relations: any[] }> {
        const maxArticles = request.maxArticles || 100
        await jobManager.updateJobStatus(job.id, 'analyzing', 'Analyzing papers...')
        await jobManager.updateProgress(job.id, 50)

        const allEntities: any[] = []
        const allRelations: any[] = []

        const processable = articles.filter(a => a.pdfUrl || a.abstract || a.title)
        const limit = Math.min(processable.length, maxArticles)
        jobManager.log(job.id, 'info', `Processing ${limit} articles(Concurrency: 3)`)

        // Process in batches of 3 to avoid rate limits but speed up analysis
        const BATCH_SIZE = 3

        for (let i = 0; i < limit; i += BATCH_SIZE) {
            // Re-fetch job status to check cancellation
            const currentJob = jobManager.getJob(job.id)
            if (currentJob?.status === 'cancelled') break

            const batch = processable.slice(i, Math.min(i + BATCH_SIZE, limit))

            await Promise.all(batch.map(async (article) => {
                if (currentJob?.status === 'cancelled') return

                try {
                    const { entities, relations } = await this.processArticle(article, job.topic)
                    if (entities.length > 0) {
                        allEntities.push(...entities)
                        allRelations.push(...relations)
                    }
                    job.articlesProcessed = (job.articlesProcessed || 0) + 1
                } catch (error) {
                    logger.warn('AnalysisService', `Failed to process article: ${article.title} `, { error })
                }
            }))

            // Update progress after each batch
            const progress = 50 + Math.floor((Math.min(i + BATCH_SIZE, limit) / limit) * 40)
            await jobManager.updateProgress(job.id, progress)
            await jobManager.persistJob(job)
        }

        return { entities: allEntities, relations: allRelations }
    }

    /**
     * Find Open Access PDFs via Unpaywall
     */
    private async findOpenAccessPdfs(articles: ArticleSource[]): Promise<ArticleSource[]> {
        const articlesWithDoi = articles.filter(a => a.doi)
        const dois = articlesWithDoi.map(a => a.doi!)

        // Batch lookup
        const oaResults = await unpaywallService.batchFindPdfs(dois)

        for (const article of articlesWithDoi) {
            const oaResult = oaResults.get(article.doi!)
            if (oaResult?.pdfUrl) {
                article.pdfUrl = oaResult.pdfUrl
            }
        }

        return articles
    }

    /**
     * Process a single article (Download -> Parse -> Extract)
     */
    async processArticle(article: ArticleSource, topic: string): Promise<{
        entities: any[]
        relations: any[]
    }> {
        if (!article.pdfUrl) {
            // Use abstract if available, otherwise fallback to title
            const content = article.abstract || article.title
            if (!content) return { entities: [], relations: [] }

            // If using only title, we treat it as a short abstract
            const chunks = await chunkingEngine.chunkText(content, article.id)
            const extracted = await entityExtractor.extractFromChunks(chunks)
            const relations = await relationExtractor.extractRelations(
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

        try {
            // Download PDF
            const response = await axios.get(article.pdfUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: { 'User-Agent': 'GraphAnalyser/1.0' }
            })
            const buffer = Buffer.from(response.data)

            // Save to local storage
            try {
                await fileStorage.savePDF(topic, {
                    year: article.year,
                    authors: article.authors,
                    title: article.title,
                    keywords: article.keywords
                }, buffer)
            } catch (err) {
                logger.warn('AnalysisService', `Failed to save PDF locally: ${article.id} `, { error: err })
            }

            // Parse PDF
            const parsed = await documentParser.parsePDF(buffer, article.title)

            // Save parsed text for search
            try {
                await fileStorage.saveText(topic, {
                    year: article.year,
                    authors: article.authors,
                    title: article.title,
                    keywords: article.keywords
                }, parsed.content)
            } catch (err) {
                logger.warn('AnalysisService', `Failed to save text locally: ${article.id}`, { error: err })
            }

            // Process
            const chunks = await chunkingEngine.chunkText(parsed.content, article.id)
            const extracted = await entityExtractor.extractFromChunks(chunks)
            const relations = await relationExtractor.extractRelations(
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
     * Generate literature review using AI
     */
    async generateReview(
        topic: string,
        entities: any[],
        articles: ArticleSource[]
    ): Promise<string> {
        if (!isFeatureEnabled('USE_AI_FEATURES')) return 'AI features disabled.'

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
                    content: `You are a scientific writer.Generate a brief literature review(2 - 3 paragraphs) based on the provided data.`
                },
                {
                    role: 'user',
                    content: `Topic: ${topic} \n\nKey entities found: ${topEntities} \n\nArticle titles: \n - ${articleTitles} \n\nGenerate a literature review summarizing what is known about this topic.`
                }
            ], { temperature: 0.7, maxTokens: 1500 })

            return response.content
        } catch (error) {
            logger.warn('AnalysisService', 'Failed to generate review', { error })
            return 'Literature review generation failed.'
        }
    }
}

export const analysisService = new AnalysisService()
