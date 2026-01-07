import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import articlesRouter from './routes/articles'
import analysisRouter from './routes/analysis'
import graphRouter from './routes/graph'
import graphsRouter from './routes/graphs'
import gapsRouter from './routes/gaps'
import patternsRouter from './routes/patterns'
import statisticsRouter from './routes/statistics'
import exportRouter from './routes/export'
import adminRouter from './routes/admin'
import pubmedRouter from './routes/pubmed'
import graphAnalysisRouter from './routes/graphAnalysis'
import searchRouter from './routes/search'
import systemRouter from './routes/system'
import documentsRouter from './routes/documents'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/articles', articlesRouter)
app.use('/analysis', analysisRouter)
app.use('/graph', graphRouter)
app.use('/api/graphs', graphsRouter)
app.use('/gaps', gapsRouter)
app.use('/patterns', patternsRouter)
app.use('/statistics', statisticsRouter)
app.use('/export', exportRouter)
app.use('/api/admin', adminRouter)
app.use('/pubmed', pubmedRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/analysis', graphAnalysisRouter)
app.use('/api/search', searchRouter)
app.use('/api/system', systemRouter)

app.get('/health', (req, res) => {
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
