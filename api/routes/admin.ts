import express from 'express'
import logger from '../../src/core/Logger'
import errorHandler from '../../src/core/ErrorHandler'
import sessionManager from '../../src/core/SessionManager'
import databaseManager from '../../src/core/Database'

const router = express.Router()

router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      sessions: sessionManager.getSessionMetrics(),
      database: databaseManager.getMetrics(),
      errors: errorHandler.getMetrics(),
      logs: logger.getLogs()
    }

    res.json(metrics)
  } catch (error) {
    const appError = errorHandler.handle(error instanceof Error ? error : new Error(String(error)), req.id?.toString())
    res.status(appError.statusCode).json(errorHandler.createErrorResponse(appError))
  }
})

router.delete('/logs', (req, res) => {
  try {
    logger.clearLogs()
    res.json({ success: true, message: 'Logs cleared successfully' })
  } catch (error) {
    const appError = errorHandler.handle(error instanceof Error ? error : new Error(String(error)), req.id?.toString())
    res.status(appError.statusCode).json(errorHandler.createErrorResponse(appError))
  }
})

router.delete('/errors', (req, res) => {
  try {
    errorHandler.clearMetrics()
    res.json({ success: true, message: 'Errors cleared successfully' })
  } catch (error) {
    const appError = errorHandler.handle(error instanceof Error ? error : new Error(String(error)), req.id?.toString())
    res.status(appError.statusCode).json(errorHandler.createErrorResponse(appError))
  }
})

export default router
