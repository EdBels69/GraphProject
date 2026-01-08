import express from 'express'
import { databaseManager } from '../../src/core/Database'
import { logger } from '../../src/core/Logger'

const router = express.Router()

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
  const metadata = article.metadata || {}
  return {
    id: article.id,
    title: article.title,
    year: metadata.year || article.uploadedAt?.getFullYear() || new Date().getFullYear(),
    citations: metadata.citations || 0,
    category: metadata.source || 'Uploaded',
    author: Array.isArray(metadata.authors) ? metadata.authors.join(', ') : (metadata.author || 'Unknown'),
    abstract: article.content || '',
    keywords: metadata.entitiesPreview || metadata.keywords || [],
    url: article.url
  }
}

router.post('/', async (req, res) => {
  try {
    const { title, year, citations, category, author, abstract, keywords } = req.body

    const article = await databaseManager.createArticle({
      title,
      content: abstract || '',
      status: 'completed',
      metadata: {
        year,
        citations,
        source: category,
        author,
        keywords
      }
    })

    res.status(201).json(mapArticleToNode(article))
  } catch (error) {
    logger.error('ArticlesRoute', 'Failed to upload article', { error })
    res.status(500).json({ error: 'Failed to upload article' })
  }
})

router.get('/', async (req, res) => {
  try {
    const articles = await databaseManager.getArticles()
    const nodes = articles.map(mapArticleToNode)
    res.json(nodes)
  } catch (error) {
    logger.error('ArticlesRoute', 'Failed to fetch articles', { error })
    res.status(500).json({ error: 'Failed to fetch articles' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const article = await databaseManager.getArticle(req.params.id)
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
  try {
    const updated = await databaseManager.updateArticle(req.params.id, req.body)
    if (!updated) {
      return res.status(404).json({ error: 'Article not found' })
    }
    res.json(mapArticleToNode(updated))
  } catch (error) {
    logger.error('ArticlesRoute', 'Failed to update article', { error })
    res.status(500).json({ error: 'Failed to update article' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await databaseManager.deleteArticle(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Article not found' })
    }
    res.status(204).send()
  } catch (error) {
    logger.error('ArticlesRoute', 'Failed to delete article', { error })
    res.status(500).json({ error: 'Failed to delete article' })
  }
})

export default router
