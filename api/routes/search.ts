import express from 'express'
import { GlobalSearch } from '../services/globalSearch'
import { SourceDownloader } from '../services/sourceDownload'

const router = express.Router()

const globalSearch = new GlobalSearch()
const sourceDownloader = new SourceDownloader()

/**
 * GET /api/search
 * Search multiple sources for articles
 */
router.get('/', async (req, res) => {
  try {
    const { q, sources, maxResults, yearFrom, yearTo, sortBy } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter q is required' })
    }

    const sourceArray = sources
      ? (sources as string).split(',')
      : ['scholar', 'pubmed', 'crossref']

    const results = await globalSearch.search({
      query: q,
      sources: sourceArray as Array<'scholar' | 'pubmed' | 'crossref' | 'arxiv'>,
      maxResults: maxResults ? parseInt(maxResults as string) : 20,
      yearFrom: yearFrom ? parseInt(yearFrom as string) : undefined,
      yearTo: yearTo ? parseInt(yearTo as string) : undefined,
      sortBy: ((sortBy as string) || 'relevance') as 'relevance' | 'date' | 'citations'
    })

    res.json(results)
  } catch (error) {
    console.error('Error searching:', error)
    res.status(500).json({ error: 'Failed to search' })
  }
})

/**
 * POST /api/search/advanced
 * Advanced search with filters
 */
router.post('/advanced', async (req, res) => {
  try {
    const { query, sources, maxResults, yearFrom, yearTo, sortBy, fields, hasAbstract, hasDoi, minCitations } = req.body

    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    const results = await globalSearch.advancedSearch({
      query,
      sources,
      maxResults,
      yearFrom,
      yearTo,
      sortBy,
      fields,
      hasAbstract,
      hasDoi,
      minCitations
    })

    res.json(results)
  } catch (error) {
    console.error('Error in advanced search:', error)
    res.status(500).json({ error: 'Failed to perform advanced search' })
  }
})

/**
 * POST /api/search/download
 * Start a batch download job
 */
router.post('/download', async (req, res) => {
  try {
    const { urls, outputDir, maxConcurrent, retryAttempts, timeout } = req.body

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'urls array is required' })
    }

    if (!outputDir) {
      return res.status(400).json({ error: 'outputDir is required' })
    }

    // Validate URLs
    const validUrls = urls.filter((url: string) => sourceDownloader.validateUrl(url))

    if (validUrls.length === 0) {
      return res.status(400).json({ error: 'No valid URLs provided' })
    }

    const job = await sourceDownloader.downloadBatch({
      urls: validUrls,
      outputDir,
      maxConcurrent,
      retryAttempts,
      timeout
    })

    res.json({
      jobId: job.id,
      status: job.status,
      total: job.total,
      message: 'Download job started'
    })
  } catch (error) {
    console.error('Error starting download job:', error)
    res.status(500).json({ error: 'Failed to start download job' })
  }
})

/**
 * GET /api/search/download/status/:jobId
 * Get download job status
 */
router.get('/download/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const job = sourceDownloader.getJobStatus(jobId)

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    const statistics = sourceDownloader.getJobStatistics(jobId)

    res.json({
      jobId: job.id,
      status: job.status,
      total: job.total,
      completed: job.completed,
      failed: job.failed,
      results: job.results.slice(0, 10), // Return first 10 results
      startTime: job.startTime,
      endTime: job.endTime,
      error: job.error,
      statistics
    })
  } catch (error) {
    console.error('Error getting job status:', error)
    res.status(500).json({ error: 'Failed to get job status' })
  }
})

/**
 * DELETE /api/search/download/:jobId
 * Cancel a download job
 */
router.delete('/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const cancelled = sourceDownloader.cancelJob(jobId)

    if (!cancelled) {
      return res.status(404).json({ error: 'Job not found or cannot be cancelled' })
    }

    res.json({
      jobId,
      status: 'cancelled',
      message: 'Job cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling job:', error)
    res.status(500).json({ error: 'Failed to cancel job' })
  }
})

/**
 * GET /api/search/citations/:doi
 * Get citation information for a DOI
 */
router.get('/citations/:doi', async (req, res) => {
  try {
    const { doi } = req.params

    if (!doi) {
      return res.status(400).json({ error: 'DOI is required' })
    }

    const article = await globalSearch.getArticleByDOI(doi)

    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }

    res.json(article)
  } catch (error) {
    console.error('Error getting article by DOI:', error)
    res.status(500).json({ error: 'Failed to get article' })
  }
})

/**
 * GET /api/search/jobs
 * Get all download jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = sourceDownloader.getAllJobs()

    res.json({
      total: jobs.length,
      jobs: jobs.map(job => ({
        id: job.id,
        status: job.status,
        total: job.total,
        completed: job.completed,
        failed: job.failed,
        startTime: job.startTime,
        endTime: job.endTime
      }))
    })
  } catch (error) {
    console.error('Error getting jobs:', error)
    res.status(500).json({ error: 'Failed to get jobs' })
  }
})

/**
 * POST /api/search/validate-urls
 * Validate URLs before downloading
 */
router.post('/validate-urls', async (req, res) => {
  try {
    const { urls } = req.body

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'urls array is required' })
    }

    const validationResults = await Promise.all(
      urls.map(async (url: string) => ({
        url,
        valid: sourceDownloader.validateUrl(url),
        accessible: await sourceDownloader.checkUrl(url)
      }))
    )

    const validUrls = validationResults.filter(r => r.valid)
    const accessibleUrls = validationResults.filter(r => r.accessible)

    res.json({
      total: urls.length,
      valid: validUrls.length,
      accessible: accessibleUrls.length,
      results: validationResults
    })
  } catch (error) {
    console.error('Error validating URLs:', error)
    res.status(500).json({ error: 'Failed to validate URLs' })
  }
})

export default router
