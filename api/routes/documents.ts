import express from 'express'
import multer from 'multer'
import { DocumentParser } from '../services/documentParser'
import { ChunkingEngine } from '../services/chunkingEngine'
import { EntityExtractor } from '../services/entityExtractor'
import { RelationExtractor } from '../services/relationExtractor'
import { KnowledgeGraphBuilder } from '../services/knowledgeGraphBuilder'
import { summarizeDocument } from '../services/aiService'
import { isFeatureEnabled } from '../../shared/config/features'

const router = express.Router()

// Extend Express Request type for multer array upload
declare global {
  namespace Express {
    interface Request {
      file?: Multer.File
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] }
    }
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'))
    }
  }
})

const documentParser = new DocumentParser()
const chunkingEngine = new ChunkingEngine()
const entityExtractor = new EntityExtractor()
const relationExtractor = new RelationExtractor()
const knowledgeGraphBuilder = new KnowledgeGraphBuilder()

/**
 * POST /api/documents/upload
 * Upload and process a document
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { buffer, originalname, mimetype } = req.file
    const fileType = mimetype === 'application/pdf' ? 'pdf' :
      mimetype.includes('word') ? 'docx' : 'txt'

    // Parse document
    let parsedDocument
    if (fileType === 'pdf') {
      parsedDocument = await documentParser.parsePDF(buffer)
    } else if (fileType === 'docx') {
      parsedDocument = await documentParser.parseDOCX(buffer)
    } else {
      parsedDocument = await documentParser.parseText(buffer.toString('utf-8'), originalname)
    }

    // Chunk the content
    const chunks = await chunkingEngine.chunkText(
      parsedDocument.content,
      parsedDocument.id
    )

    // Extract entities
    const extractedEntities = await entityExtractor.extractFromChunks(chunks)

    // Extract relations
    const extractedRelations = await relationExtractor.extractRelations(
      parsedDocument.content,
      extractedEntities.entities,
      parsedDocument.id
    )

    // Build knowledge graph
    const knowledgeGraph = await knowledgeGraphBuilder.buildGraph(
      extractedEntities.entities,
      extractedRelations.relations
    )

    // Generate summary optionally
    let summary = undefined
    if (isFeatureEnabled('USE_AI_FEATURES')) {
      summary = await summarizeDocument(parsedDocument.content, parsedDocument.title)
    }

    res.json({
      document: {
        id: parsedDocument.id,
        title: parsedDocument.title,
        fileName: originalname,
        fileType,
        pageCount: parsedDocument.metadata.pageCount,
        extractedAt: parsedDocument.metadata.extractedAt,
        summary: summary?.summary,
        keyFindings: summary?.keyFindings
      },
      chunks: {
        total: chunks.length,
        items: chunks.slice(0, 10) // Return first 10 chunks for preview
      },
      entities: extractedEntities.statistics,
      relations: extractedRelations.statistics,
      graph: {
        nodes: knowledgeGraph.graph.nodes.length,
        edges: knowledgeGraph.graph.edges.length
      },
      knowledgeGraph
    })
  } catch (error) {
    console.error('Error processing document:', error)
    res.status(500).json({ error: 'Failed to process document' })
  }
})

/**
 * POST /api/documents/url
 * Process a document from URL
 */
router.post('/url', async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Parse document from URL
    const parsedDocument = await documentParser.parseFromURL(url)

    // Chunk the content
    const chunks = await chunkingEngine.chunkText(
      parsedDocument.content,
      parsedDocument.id
    )

    // Extract entities
    const extractedEntities = await entityExtractor.extractFromChunks(chunks)

    // Extract relations
    const extractedRelations = await relationExtractor.extractRelations(
      parsedDocument.content,
      extractedEntities.entities,
      parsedDocument.id
    )

    // Build knowledge graph
    const knowledgeGraph = await knowledgeGraphBuilder.buildGraph(
      extractedEntities.entities,
      extractedRelations.relations
    )

    // Generate summary optionally
    let summary = undefined
    if (isFeatureEnabled('USE_AI_FEATURES')) {
      summary = await summarizeDocument(parsedDocument.content, parsedDocument.title)
    }

    res.json({
      document: {
        id: parsedDocument.id,
        title: parsedDocument.title,
        url,
        extractedAt: parsedDocument.metadata.extractedAt,
        summary: summary?.summary,
        keyFindings: summary?.keyFindings
      },
      chunks: {
        total: chunks.length,
        items: chunks.slice(0, 10)
      },
      entities: extractedEntities.statistics,
      relations: extractedRelations.statistics,
      graph: {
        nodes: knowledgeGraph.graph.nodes.length,
        edges: knowledgeGraph.graph.edges.length
      },
      knowledgeGraph
    })
  } catch (error) {
    console.error('Error processing document from URL:', error)
    res.status(500).json({ error: 'Failed to process document from URL' })
  }
})

/**
 * POST /api/documents/batch
 * Process multiple documents
 */
router.post('/batch', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const results = []
    const allEntities = []
    const allRelations = []

    for (const file of req.files) {
      try {
        const { buffer, originalname, mimetype } = file
        const fileType = mimetype === 'application/pdf' ? 'pdf' :
          mimetype.includes('word') ? 'docx' : 'txt'

        // Parse document
        let parsedDocument
        if (fileType === 'pdf') {
          parsedDocument = await documentParser.parsePDF(buffer)
        } else if (fileType === 'docx') {
          parsedDocument = await documentParser.parseDOCX(buffer)
        } else {
          parsedDocument = await documentParser.parseText(buffer.toString('utf-8'), originalname)
        }

        // Chunk the content
        const chunks = await chunkingEngine.chunkText(
          parsedDocument.content,
          parsedDocument.id
        )

        // Extract entities
        const extractedEntities = await entityExtractor.extractFromChunks(chunks)
        allEntities.push(...extractedEntities.entities)

        // Extract relations
        const extractedRelations = await relationExtractor.extractRelations(
          parsedDocument.content,
          extractedEntities.entities,
          parsedDocument.id
        )
        allRelations.push(...extractedRelations.relations)

        results.push({
          fileName: originalname,
          status: 'success',
          documentId: parsedDocument.id,
          entities: extractedEntities.statistics,
          relations: extractedRelations.statistics
        })
      } catch (error) {
        results.push({
          fileName: file.originalname,
          status: 'error',
          error: (error as Error).message
        })
      }
    }

    // Build merged knowledge graph
    const mergedKnowledgeGraph = await knowledgeGraphBuilder.buildGraph(
      allEntities,
      allRelations
    )

    res.json({
      results,
      mergedGraph: {
        nodes: mergedKnowledgeGraph.graph.nodes.length,
        edges: mergedKnowledgeGraph.graph.edges.length
      },
      knowledgeGraph: mergedKnowledgeGraph
    })
  } catch (error) {
    console.error('Error processing batch documents:', error)
    res.status(500).json({ error: 'Failed to process batch documents' })
  }
})

/**
 * GET /api/documents/:id/export
 * Export processed document data in various formats
 */
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params
    const { format = 'json' } = req.query

    // In a real implementation, you would fetch the document from storage
    // For now, return a placeholder response
    res.json({
      message: 'Export functionality requires database integration',
      documentId: id,
      format
    })
  } catch (error) {
    console.error('Error exporting document:', error)
    res.status(500).json({ error: 'Failed to export document' })
  }
})

export default router
