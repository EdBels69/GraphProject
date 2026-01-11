import 'dotenv/config'
import express from 'express'
import cors from 'cors'

console.log('Server starting... (Force Restart)')
console.log('CWD:', process.cwd())
console.log('DATABASE_URL:', process.env.DATABASE_URL)


import path from 'path'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import articlesRouter from './routes/articles'
import analysisRouter from './routes/analysis'
import graphsRouter from './routes/graphs'
import statisticsRouter from './routes/statistics'
import exportRouter from './routes/export'
import adminRouter from './routes/admin'
import pubmedRouter from './routes/pubmed'
import searchRouter from './routes/search'
import systemRouter from './routes/system'
import documentsRouter from './routes/documents'
import meshRouter from './routes/mesh'
import aiRouter from './routes/ai'
import researchRouter from './routes/research'
import configRouter from './routes/config'
import { ApiResponse } from './utils/response'
import { AppError, ErrorCode } from './utils/errors'
import { logger } from '../api/core/Logger'





const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Auth Middleware
// Auth Middleware
// Auth Middleware (BYPASS MODE)
const authMiddleware = async (req: any, res: any, next: any) => {
  // Simulating a logged-in Admin user for local development
  req.user = {
    id: 'local-admin',
    email: 'admin@local.com',
    app_metadata: {
      role: 'admin'
    },
    user_metadata: {
      name: 'Local Admin'
    }
  }
  next()
}

// Admin Middleware
const adminMiddleware = (req: any, res: any, next: any) => {
  if (req.user?.app_metadata?.role !== 'admin' && req.user?.email !== process.env.ADMIN_EMAIL) {
    return ApiResponse.error(res, 'Forbidden: Admin access only', 403, ErrorCode.FORBIDDEN)
  }
  next()
}

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Graph Analyser API'
}))
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec))

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected routes
app.use('/api/articles', authMiddleware, articlesRouter)
app.use('/api/analysis', authMiddleware, analysisRouter)
app.use('/api/graphs', authMiddleware, graphsRouter)
app.use('/api/statistics', authMiddleware, statisticsRouter)
app.use('/api/export', authMiddleware, exportRouter)
app.use('/api/pubmed', authMiddleware, pubmedRouter)
app.use('/api/documents', authMiddleware, documentsRouter)
app.use('/api/search', authMiddleware, searchRouter)
app.use('/api/ai', authMiddleware, aiRouter)
app.use('/api/research', authMiddleware, researchRouter)
app.use('/api/config', authMiddleware, configRouter)

// Admin/System usually need extra protection
app.use('/api/admin', authMiddleware, adminMiddleware, adminRouter)
app.use('/api/system', authMiddleware, adminMiddleware, systemRouter)
app.use('/api/mesh', authMiddleware, meshRouter)

// Serve Static Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../public')
  app.use(express.static(publicPath))

  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
} else {
  // 404 for API routes in dev
  app.use((req: express.Request, res: express.Response) => {
    return ApiResponse.error(res, 'Route not found', 404, ErrorCode.NOT_FOUND)
  })
}

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errorCode)
  }

  logger.error('GlobalErrorHandler', 'Unhandled error caught', {
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
    path: req.path,
    method: req.method
  })

  return ApiResponse.error(res, 'An unexpected error occurred')
})

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

startServer()
