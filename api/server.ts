import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import articlesRouter from './routes/articles'
import analysisRouter from './routes/analysis'
import graphRouter from './routes/graph'
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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Graph Analyser API'
}))
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec))

app.use('/api/articles', articlesRouter)
app.use('/api/analysis', analysisRouter)
app.use('/api/graph', graphRouter)
app.use('/api/graphs', graphsRouter)
app.use('/api/statistics', statisticsRouter)
app.use('/api/export', exportRouter)
app.use('/api/admin', adminRouter)
app.use('/api/pubmed', pubmedRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/search', searchRouter)
app.use('/api/system', systemRouter)
app.use('/api/mesh', meshRouter)
app.use('/api/ai', aiRouter)
app.use('/api/research', researchRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  })
})

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

startServer()
