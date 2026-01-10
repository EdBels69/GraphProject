import express from 'express'
import { analysisService } from '../services/AnalysisService'
import { logger } from '../core/Logger'
import { ApiResponse } from '../utils/response'
import { AppError } from '../utils/errors'

const router = express.Router()

// GET /api/analysis/:graphId/metrics
router.get('/:graphId/metrics', async (req: any, res) => {
  try {
    const userId = req.user.id
    const graphId = req.params.graphId
    const metrics = await analysisService.getMetrics(graphId, userId)
    return ApiResponse.success(res, metrics)
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode, error.errorCode)
    }
    logger.error('AnalysisRoute', 'Failed to fetch metrics', { error })
    return ApiResponse.error(res, 'Internal server error')
  }
})

// GET /api/analysis/:graphId/centrality
router.get('/:graphId/centrality', async (req: any, res) => {
  try {
    const userId = req.user.id
    const graphId = req.params.graphId
    const centrality = await analysisService.getCentrality(graphId, userId)
    return ApiResponse.success(res, centrality)
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode, error.errorCode)
    }
    logger.error('AnalysisRoute', 'Failed to fetch centrality', { error })
    return ApiResponse.error(res, 'Internal server error')
  }
})

// GET /api/analysis/:graphId/communities
router.get('/:graphId/communities', async (req: any, res) => {
  try {
    const userId = req.user.id
    const graphId = req.params.graphId
    const communities = await analysisService.getCommunities(graphId, userId)
    return ApiResponse.success(res, communities)
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode, error.errorCode)
    }
    logger.error('AnalysisRoute', 'Failed to fetch communities', { error })
    return ApiResponse.error(res, 'Internal server error')
  }
})

// GET /api/analysis/:graphId/gaps
router.get('/:graphId/gaps', async (req: any, res) => {
  try {
    const userId = req.user.id
    const graphId = req.params.graphId
    const gaps = await analysisService.getGaps(graphId, userId)
    return ApiResponse.success(res, gaps)
  } catch (error) {
    if (error instanceof AppError) {
      return ApiResponse.error(res, error.message, error.statusCode, error.errorCode)
    }
    logger.error('AnalysisRoute', 'Failed to fetch gaps', { error })
    return ApiResponse.error(res, 'Internal server error')
  }
})

export default router
