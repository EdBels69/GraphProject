import { Request, Response } from 'express'
import { databaseManager } from '../core/Database'
import { logger } from '../core/Logger'

const UPLOADED_JOB_ID = 'uploaded-articles-job'
const UPLOADED_JOB_TOPIC = 'Manual Uploads'

interface ArticleNode {
    id: string
    title: string
    year: number
    citations: number
    category: string
    author: string
    abstract: string
    keywords: string[]
    url?: string
}

export class ArticleController {

    private static mapArticleToNode(article: any): ArticleNode {
        // Try to parse 'extractedData' if available for metadata
        const extracted = article.extractedData || {}

        return {
            id: article.id,
            title: article.title,
            year: article.year || new Date().getFullYear(),
            citations: extracted.citations || 0,
            category: article.source || 'Uploaded',
            author: Array.isArray(article.authors) ? article.authors.join(', ') : 'Unknown',
            abstract: article.abstract || '',
            keywords: extracted.keywords || [],
            url: article.url || article.pdfUrl
        }
    }

    // Ensure default job exists
    private static async ensureUploadJob(userId: string) {
        const job = await databaseManager.getResearchJob(UPLOADED_JOB_ID, userId)
        if (!job) {
            await databaseManager.saveResearchJob({
                id: UPLOADED_JOB_ID,
                userId,
                topic: UPLOADED_JOB_TOPIC,
                mode: 'quick',
                status: 'completed',
                articlesFound: 0,
                progress: 100,
                queries: [],
                articles: [],
                createdAt: new Date(),
                updatedAt: new Date()
            })
        }
    }

    static async create(req: any, res: Response) {
        try {
            const userId = req.user.id
            await ArticleController.ensureUploadJob(userId)
            const { title, year, citations, category, author, abstract, keywords } = req.body

            const articleId = `article-${Date.now()}`

            // Create compatible article object
            const article = {
                id: articleId,
                title,
                abstract: abstract || '',
                status: 'completed',
                source: category || 'manual',
                authors: author ? [author] : [],
                year: parseInt(year) || new Date().getFullYear(),
                doi: '',
                url: '',
                extractedData: {
                    citations,
                    keywords
                }
            }

            await databaseManager.saveJobArticles(UPLOADED_JOB_ID, userId, [article])

            res.status(201).json(ArticleController.mapArticleToNode(article))
        } catch (error) {
            logger.error('ArticleController', 'Failed to upload article', { error })
            res.status(500).json({ error: 'Failed to upload article' })
        }
    }

    static async getAll(req: any, res: Response) {
        try {
            const userId = req.user.id
            await ArticleController.ensureUploadJob(userId)
            const articles = await databaseManager.getJobArticles(UPLOADED_JOB_ID, userId)
            const nodes = articles.map(ArticleController.mapArticleToNode)
            res.json(nodes)
        } catch (error) {
            logger.error('ArticleController', 'Failed to fetch articles', { error })
            res.status(500).json({ error: 'Failed to fetch articles' })
        }
    }

    static async getById(req: any, res: Response) {
        try {
            const userId = req.user.id
            const articles = await databaseManager.getJobArticles(UPLOADED_JOB_ID, userId)
            const article = articles.find(a => a.id === req.params.id)

            if (!article) {
                return res.status(404).json({ error: 'Article not found' })
            }
            res.json(ArticleController.mapArticleToNode(article))
        } catch (error) {
            logger.error('ArticleController', 'Failed to fetch article', { error })
            res.status(500).json({ error: 'Failed to fetch article' })
        }
    }
}
