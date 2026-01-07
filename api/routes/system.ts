import express from 'express'
import { CacheManager } from '../services/cacheManager'
import { PerformanceMonitor } from '../services/performanceMonitor'

const router = express.Router()

const cacheManager = new CacheManager()
const performanceMonitor = new PerformanceMonitor()

/**
 * GET /api/system/health
 * Get system health status
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = performanceMonitor.getHealthStatus()

    res.json({
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      issues: healthStatus.issues
    })
  } catch (error) {
    console.error('Error getting health status:', error)
    res.status(500).json({ error: 'Failed to get health status' })
  }
})

/**
 * GET /api/system/metrics
 * Get performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const { limit = 100 } = req.query
    const stats = performanceMonitor.getStats()
    const recentRequests = performanceMonitor.getRecentRequests(parseInt(limit as string) || 100)
    const recentDbMetrics = performanceMonitor.getRecentDatabaseMetrics(parseInt(limit as string) || 100)
    const recentSystemMetrics = performanceMonitor.getRecentSystemMetrics(parseInt(limit as string) || 100)

    res.json({
      timestamp: new Date().toISOString(),
      stats,
      recentRequests: recentRequests.slice(0, parseInt(limit as string) || 100),
      recentDbMetrics: recentDbMetrics.slice(0, parseInt(limit as string) || 100),
      recentSystemMetrics: recentSystemMetrics.slice(0, parseInt(limit as string) || 100)
    })
  } catch (error) {
    console.error('Error getting metrics:', error)
    res.status(500).json({ error: 'Failed to get metrics' })
  }
})

/**
 * GET /api/system/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = cacheManager.getStats()

    res.json({
      timestamp: new Date().toISOString(),
      size: stats.size,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hitRate,
      keys: stats.keys.length,
      sizeInBytes: cacheManager.getSizeInBytes()
    })
  } catch (error) {
    console.error('Error getting cache stats:', error)
    res.status(500).json({ error: 'Failed to get cache stats' })
  }
})

/**
 * POST /api/system/cache/clear
 * Clear all cache entries
 */
router.post('/cache/clear', async (req, res) => {
  try {
    const { pattern } = req.body

    if (pattern) {
      // Clear entries matching pattern
      const regex = new RegExp(pattern)
      const count = cacheManager.deleteByPattern(regex)
      cacheManager.resetStats()

      res.json({
        message: `Cleared ${count} cache entries matching pattern: ${pattern}`,
        pattern,
        count
      })
    } else {
      // Clear all entries
      cacheManager.clear()
      cacheManager.resetStats()

      res.json({
        message: 'Cache cleared successfully',
        cleared: true
      })
    }
  } catch (error) {
    console.error('Error clearing cache:', error)
    res.status(500).json({ error: 'Failed to clear cache' })
  }
})

/**
 * GET /api/system/cache/keys
 * Get all cache keys
 */
router.get('/cache/keys', async (req, res) => {
  try {
    const keys = cacheManager.keys()

    res.json({
      timestamp: new Date().toISOString(),
      count: keys.length,
      keys
    })
  } catch (error) {
    console.error('Error getting cache keys:', error)
    res.status(500).json({ error: 'Failed to get cache keys' })
  }
})

/**
 * GET /api/system/slow-requests
 * Get slow requests
 */
router.get('/slow-requests', async (req, res) => {
  try {
    const { threshold = 5000 } = req.query
    const slowRequests = performanceMonitor.getSlowRequests(parseInt(threshold as string) || 5000)

    res.json({
      timestamp: new Date().toISOString(),
      threshold,
      count: slowRequests.length,
      requests: slowRequests
    })
  } catch (error) {
    console.error('Error getting slow requests:', error)
    res.status(500).json({ error: 'Failed to get slow requests' })
  }
})

/**
 * GET /api/system/slow-queries
 * Get slow database queries
 */
router.get('/slow-queries', async (req, res) => {
  try {
    const { threshold = 1000 } = req.query
    const slowQueries = performanceMonitor.getSlowQueries(parseInt(threshold as string) || 1000)

    res.json({
      timestamp: new Date().toISOString(),
      threshold,
      count: slowQueries.length,
      queries: slowQueries
    })
  } catch (error) {
    console.error('Error getting slow queries:', error)
    res.status(500).json({ error: 'Failed to get slow queries' })
  }
})

/**
 * GET /api/system/jobs
 * Get all jobs (placeholder - would integrate with job queue)
 */
router.get('/jobs', async (req, res) => {
  try {
    // In a real implementation, you would fetch jobs from the job queue
    res.json({
      message: 'Job queue integration required',
      timestamp: new Date().toISOString(),
      jobs: []
    })
  } catch (error) {
    console.error('Error getting jobs:', error)
    res.status(500).json({ error: 'Failed to get jobs' })
  }
})

/**
 * POST /api/system/metrics/reset
 * Reset performance metrics
 */
router.post('/metrics/reset', async (req, res) => {
  try {
    performanceMonitor.clearMetrics()

    res.json({
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error resetting metrics:', error)
    res.status(500).json({ error: 'Failed to reset metrics' })
  }
})

/**
 * GET /api/system/info
 * Get system information
 */
router.get('/info', async (req, res) => {
  try {
    res.json({
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    console.error('Error getting system info:', error)
    res.status(500).json({ error: 'Failed to get system info' })
  }
})

/**
 * GET /api/system/cache/warm
 * Warm cache with predefined values
 */
router.post('/cache/warm', async (req, res) => {
  try {
    const { entries } = req.body

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'entries array is required' })
    }

    await cacheManager.warm(entries)

    res.json({
      message: 'Cache warmed successfully',
      count: entries.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error warming cache:', error)
    res.status(500).json({ error: 'Failed to warm cache' })
  }
})

export default router
