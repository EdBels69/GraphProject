import express from 'express'
import { databaseManager } from '../../src/core/Database'
import { logger } from '../../src/core/Logger'

const router = express.Router()

const UPLOADED_JOB_ID = 'uploaded-articles-job'
const UPLOADED_JOB_TOPIC = 'Manual Uploads'

// Ensure default job exists
async function ensureUploadJob() {
  const job = await databaseManager.getResearchJob(UPLOADED_JOB_ID)
  if (!job) {
    await databaseManager.saveResearchJob({
      id: UPLOADED_JOB_ID,
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

// Frontend interface
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

// Helper to map DB Article to Frontend ArticleNode
function mapArticleToNode(article: any): ArticleNode {
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

router.post('/', async (req, res) => {
  try {
    await ensureUploadJob()
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

    await databaseManager.saveJobArticles(UPLOADED_JOB_ID, [article])

    res.status(201).json(mapArticleToNode(article))
  } catch (error) {
    logger.error('ArticlesRoute', 'Failed to upload article', { error })
    res.status(500).json({ error: 'Failed to upload article' })
  }
})

router.get('/', async (req, res) => {
  try {
    await ensureUploadJob()
    const articles = await databaseManager.getJobArticles(UPLOADED_JOB_ID)
    const nodes = articles.map(mapArticleToNode)
    res.json(nodes)
  } catch (error) {
    logger.error('ArticlesRoute', 'Failed to fetch articles', { error })
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const articles = await databaseManager.getJobArticles(UPLOADED_JOB_ID)
    const article = articles.find(a => a.id === req.params.id)

    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    res.json(mapArticleToNode(article))
  } catch (error) {
    logger.error('ArticlesRoute', 'Failed to fetch article', { error })
    res.status(500).json({ error: 'Failed to fetch article' })
  }
})

router.put('/:id', async (req, res) => {
  // Not implemented fully as saveJobArticles is upsert, but we need to fetch first
  return res.status(501).json({ error: 'Update not fully implemented' })
})

router.delete('/:id', async (req, res) => {
  // Delete not directly supported by saveJobArticles (metadata only)
  // Would need specific deleteJobArticle method in DB
  return res.status(501).json({ error: 'Delete not implemented' })
})

export default router
