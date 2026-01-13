
import express from 'express'
import cors from 'cors'
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
import methodsRouter from './routes/methods'
import configRouter from './routes/config'
import snapshotRouter from './routes/snapshots'
import pdfRouter from './routes/pdf'
import universalExportRouter from './routes/universalExport'
import gapAnalysisRouter from './routes/gapAnalysis'
import reportRouter from './routes/report'
import { ApiResponse } from './utils/response'
import { AppError, ErrorCode } from './utils/errors'
import { errorMonitor } from './services/ErrorMonitor'
import { createServer } from 'http'
import { socketService } from './services/SocketService'
import rateLimit from 'express-rate-limit'

const app = express()
const httpServer = createServer(app)

// Initialize Socket Service
socketService.initialize(httpServer)

app.use(cors())
app.use(express.json())

// Global Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    skip: (req) => process.env.NODE_ENV === 'development' // Skip in dev
})

app.use('/api', apiLimiter)

// Auth Middleware (BYPASS MODE)
// Auth Middleware
const authMiddleware = async (req: any, res: any, next: any) => {
    // Check if auth bypass is enabled (DEV ONLY)
    if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
        req.user = {
            id: 'local-admin',
            email: 'admin@local.com',
            app_metadata: { role: 'admin' },
            user_metadata: { name: 'Local Admin' }
        }
        return next()
    }

    // TODO: Implement actual JWT/Session validation here or integrate with Supabase/Auth0
    // For now, in production without bypass, we fail secure
    return ApiResponse.error(res, 'Unauthorized', 401, ErrorCode.UNAUTHORIZED)
}

// Admin Middleware
const adminMiddleware = (req: any, res: any, next: any) => {
    const isAdmin = req.user?.app_metadata?.role === 'admin' || req.user?.email === process.env.ADMIN_EMAIL
    if (!isAdmin) {
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
app.use('/api/analysis', authMiddleware, gapAnalysisRouter)
app.use('/api/analysis', authMiddleware, reportRouter) // /api/analysis/report
app.use('/api/graphs', authMiddleware, graphsRouter)
app.use('/api/statistics', authMiddleware, statisticsRouter)
app.use('/api/export', authMiddleware, exportRouter)
app.use('/api/pubmed', authMiddleware, pubmedRouter)
app.use('/api/documents', authMiddleware, documentsRouter)
app.use('/api/search', authMiddleware, searchRouter)
app.use('/api/ai', authMiddleware, aiRouter)
app.use('/api/research', authMiddleware, researchRouter)
app.use('/api/pdf', authMiddleware, pdfRouter) // Batch download routes
app.use('/api/export', authMiddleware, universalExportRouter) // New Universal Export (overrides old export if path conflicts, but we'll check)
app.use('/api/methods', authMiddleware, methodsRouter)
app.use('/api/config', authMiddleware, configRouter)
app.use('/api/graphs', authMiddleware, snapshotRouter) // Mount snapshots under graphs namespace

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

    errorMonitor.captureException(err, {
        path: req.path,
        method: req.method,
        user: (req as any).user?.id
    })

    return ApiResponse.error(res, 'An unexpected error occurred')
})

export { app, httpServer }
