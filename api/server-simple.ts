import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const app = express()
const PORT = process.env.PORT || 3001

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

app.get('/', (req, res) => {
  res.json({
    message: 'Graph Analyser API Server',
    version: '1.1.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      upload: 'POST /api/upload',
      articles: 'GET /api/articles',
      graphs: 'GET /api/graphs'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

app.get('/api/articles', (req, res) => {
  res.json({
    articles: [],
    message: 'Database not connected - simple server mode'
  })
})

app.get('/api/graphs', (req, res) => {
  res.json({
    graphs: [],
    message: 'Database not connected - simple server mode'
  })
})

app.listen(PORT, () => {
  console.log('========================================')
  console.log('  Graph Analyser Backend Server')
  console.log('========================================')
  console.log('')
  console.log('[OK] Server started successfully!')
  console.log('')
  console.log(`Server URL: http://localhost:${PORT}`)
  console.log('Health check: http://localhost:' + PORT + '/health')
  console.log('')
  console.log('[INFO] Running in SIMPLE MODE (no database)')
  console.log('[INFO] Install Visual Studio Build Tools for full functionality')
  console.log('')
  console.log('[STOP] Press Ctrl+C to stop')
  console.log('========================================')
})
