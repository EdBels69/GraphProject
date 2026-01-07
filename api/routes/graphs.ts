import express, { Request, Response } from 'express'
import { Graph, GraphNode, GraphEdge, createGraph, createNode, createEdge } from '../../shared/types'
import { GraphAnalyzer } from '../../shared/graphAlgorithms'
import GraphStorage from '../../shared/graphStorage'
import { validateGraph, validateFileUpload, validateArticle } from '../../src/utils/validators'
import { DatabaseManager } from '../../src/core/Database'
import logger from '../../src/core/Logger'

const router = express.Router()

GraphStorage.initialize()

const graphsStore = new Map<string, Graph>()
const analyzers = new Map<string, GraphAnalyzer>()
const db = new DatabaseManager()
db.initialize()

async function loadGraphsFromDb() {
  try {
    const graphs = await db.getAllGraphs()
    graphs.forEach(graph => {
      graphsStore.set(graph.id, graph)
      const analyzer = new GraphAnalyzer(graph)
      analyzers.set(graph.id, analyzer)
    })
    logger.info('GraphsRoute', `Loaded ${graphs.length} graphs from database`)
  } catch (error) {
    logger.error('GraphsRoute', 'Failed to load graphs from database', { error })
  }
}

loadGraphsFromDb()

function getAnalyzer(graphId: string): GraphAnalyzer {
  let analyzer = analyzers.get(graphId)
  if (!analyzer) {
    const graph = graphsStore.get(graphId)
    if (graph) {
      analyzer = new GraphAnalyzer(graph)
      analyzers.set(graphId, analyzer)
    }
  }
  return analyzer
}

router.get('/', (req, res) => {
  const graphs = Array.from(graphsStore.values())
  res.json({
    success: true,
    data: graphs,
    count: graphs.length
  })
})

router.get('/:id', (req, res) => {
  const { id } = req.params
  const graph = graphsStore.get(id)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  res.json({
    success: true,
    data: graph
  })
})

router.post('/', (req, res) => {
  const { name, directed = false } = req.body

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Name is required and must be a string'
    })
  }

  const graph = createGraph(name, directed)
  graphsStore.set(graph.id, graph)

  const analyzer = new GraphAnalyzer(graph)
  analyzers.set(graph.id, analyzer)

  GraphStorage.save(graph)

  res.status(201).json({
    success: true,
    data: graph
  })
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const graph = graphsStore.get(id)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const { name, directed } = req.body

  if (name !== undefined) {
    graph.name = name
  }
  if (directed !== undefined) {
    graph.directed = directed
  }

  graph.updatedAt = new Date()

  GraphStorage.save(graph)

  const oldAnalyzer = analyzers.get(id)
  if (oldAnalyzer) {
    const newAnalyzer = new GraphAnalyzer(graph)
    analyzers.set(id, newAnalyzer)
  }

  res.json({
    success: true,
    data: graph
  })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  const deleted = graphsStore.delete(id)

  if (deleted) {
    analyzers.delete(id)
    GraphStorage.delete(id)

    res.json({
      success: true,
      message: 'Graph deleted successfully'
    })
  } else {
    res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }
})

router.get('/:id/nodes', (req, res) => {
  const { id } = req.params
  const graph = graphsStore.get(id)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  res.json({
    success: true,
    data: graph.nodes,
    count: graph.nodes.length
  })
})

router.post('/:id/nodes', (req, res) => {
  const { id } = req.params
  const graph = graphsStore.get(id)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const { label, weight } = req.body

  if (!label || typeof label !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Label is required and must be a string'
    })
  }

  const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const node = createNode(nodeId, label, weight)
  graph.nodes.push(node)
  graph.updatedAt = new Date()

  GraphStorage.save(graph)

  res.status(201).json({
    success: true,
    data: node
  })
})

router.delete('/:graphId/nodes/:nodeId', (req, res) => {
  const { graphId, nodeId } = req.params
  const graph = graphsStore.get(graphId)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const initialLength = graph.nodes.length
  graph.nodes = graph.nodes.filter(n => n.id !== nodeId)

  if (graph.nodes.length === initialLength) {
    return res.status(404).json({
      success: false,
      error: 'Node not found'
    })
  }

  graph.updatedAt = new Date()
  GraphStorage.save(graph)

  res.json({
    success: true,
    message: 'Node deleted successfully'
  })
})

router.get('/:id/edges', (req, res) => {
  const { id } = req.params
  const graph = graphsStore.get(id)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  res.json({
    success: true,
    data: graph.edges,
    count: graph.edges.length
  })
})

router.post('/:id/edges', (req, res) => {
  const { id } = req.params
  const graph = graphsStore.get(id)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const { source, target, weight, directed } = req.body

  if (!source || !target || typeof source !== 'string' || typeof target !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Source and target are required and must be strings'
    })
  }

  const edgeId = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const edge = createEdge(edgeId, source, target, weight)
  graph.edges.push(edge)
  graph.updatedAt = new Date()

  GraphStorage.save(graph)

  res.status(201).json({
    success: true,
    data: edge
  })
})

router.delete('/:graphId/edges/:edgeId', (req, res) => {
  const { graphId, edgeId } = req.params
  const graph = graphsStore.get(graphId)

  if (!graph) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const initialLength = graph.edges.length
  graph.edges = graph.edges.filter(e => e.id !== edgeId)

  if (graph.edges.length === initialLength) {
    return res.status(404).json({
      success: false,
      error: 'Edge not found'
    })
  }

  graph.updatedAt = new Date()
  GraphStorage.save(graph)

  res.json({
    success: true,
    message: 'Edge deleted successfully'
  })
})

router.get('/:id/shortest-path', (req, res) => {
  const { id } = req.params
  const { source, target } = req.query

  if (!source || !target || typeof source !== 'string' || typeof target !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Source and target are required query parameters'
    })
  }

  const analyzer = getAnalyzer(id)
  if (!analyzer) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const result = analyzer.findShortestPath(source, target)

  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'No path found between nodes'
    })
  }

  res.json({
    success: true,
    data: result
  })
})

router.get('/:id/all-shortest-paths', (req, res) => {
  const { id } = req.params
  const analyzer = getAnalyzer(id)
  if (!analyzer) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const allPaths = analyzer.findAllShortestPaths()

  res.json({
    success: true,
    data: allPaths
  })
})

router.get('/:id/centrality', (req, res) => {
  const { id } = req.params
  const analyzer = getAnalyzer(id)
  if (!analyzer) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const results = analyzer.calculateCentrality()

  res.json({
    success: true,
    data: results
  })
})

router.get('/:id/connectivity', (req, res) => {
  const { id } = req.params
  const analyzer = getAnalyzer(id)
  if (!analyzer) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const result = analyzer.checkConnectivity()

  res.json({
    success: true,
    data: result
  })
})

router.get('/:id/statistics', (req, res) => {
  const { id } = req.params
  const analyzer = getAnalyzer(id)
  if (!analyzer) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const stats = analyzer.calculateStatistics()

  res.json({
    success: true,
    data: stats
  })
})

router.post('/:id/validate', (req, res) => {
  const { id } = req.params
  const analyzer = getAnalyzer(id)
  if (!analyzer) {
    return res.status(404).json({
      success: false,
      error: 'Graph not found'
    })
  }

  const validation = analyzer.validate()

  res.json({
    success: true,
    data: validation
  })
})

router.post('/upload', async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      })
    }

    const file = req.file
    const validation = validateFileUpload(file)
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      })
    }

    const fileContent = file.buffer.toString('utf-8')
    let parsedData

    try {
      const extension = file.originalname.split('.').pop()?.toLowerCase()
      
      switch (extension) {
        case 'json':
          parsedData = JSON.parse(fileContent)
          break
        case 'csv':
          parsedData = parseCSV(fileContent)
          break
        case 'bib':
        case 'txt':
          parsedData = parseBibTeX(fileContent)
          break
        default:
          return res.status(400).json({
            success: false,
            error: 'Unsupported file format'
          })
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse file'
      })
    }

    const graph = buildGraphFromData(parsedData, file.originalname)
    const graphValidation = validateGraph(graph)

    if (!graphValidation.valid) {
      return res.status(400).json({
        success: false,
        errors: graphValidation.errors
      })
    }

    graphsStore.set(graph.id, graph)
    const analyzer = new GraphAnalyzer(graph)
    analyzers.set(graph.id, analyzer)

    try {
      await db.saveGraphToDb(graph)
    } catch (error) {
      logger.error('GraphsRoute', 'Failed to save graph to database', { error })
    }

    GraphStorage.save(graph)

    res.status(201).json({
      success: true,
      data: {
        graph,
        stats: {
          totalNodes: graph.nodes.length,
          totalEdges: graph.edges.length
        }
      }
    })
  } catch (error) {
    logger.error('GraphsRoute', 'Upload error', { error })
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

function parseCSV(content: string) {
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  
  const articles = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const article = {}
    headers.forEach((header, index) => {
      article[header] = values[index] || ''
    })
    articles.push(article)
  }
  
  return { articles }
}

function parseBibTeX(content: string) {
  const entries = content.split(/@/g).filter(e => e.trim())
  const articles = []
  
  entries.forEach(entry => {
    const match = entry.match(/(\w+)\s*\{([^,]+),/i)
    if (!match) return
    
    const fields: any = {}
    const fieldRegex = /(\w+)\s*=\s*(?:\{([^}]*)\}|\"([^\"]*)\")/g
    let fieldMatch
    
    while ((fieldMatch = fieldRegex.exec(entry)) !== null) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2] || fieldMatch[3] || ''
    }
    
    articles.push({
      id: match[2],
      title: fields.title || '',
      authors: fields.author ? fields.author.split(' and ') : [],
      year: parseInt(fields.year) || 0,
      abstract: fields.abstract || '',
      keywords: fields.keywords ? fields.keywords.split(',').map((k: string) => k.trim()) : [],
      citations: []
    })
  })
  
  return { articles }
}

function buildGraphFromData(data: any, filename: string): Graph {
  const articles = data.articles || []
  
  const nodes = articles.map((article: any) => ({
    id: article.id || `node-${Date.now()}-${Math.random()}`,
    data: {
      label: article.title || 'Untitled',
      title: article.title || '',
      authors: article.authors || [],
      year: article.year || new Date().getFullYear(),
      citations: article.citations?.length || 0
    }
  }))

  const edges: any[] = []
  articles.forEach((article: any, index: number) => {
    if (article.citations && Array.isArray(article.citations)) {
      article.citations.forEach((citationId: string) => {
        if (citationId && citationId !== article.id) {
          edges.push({
            id: `edge-${Date.now()}-${Math.random()}`,
            source: article.id,
            target: citationId
          })
        }
      })
    }
  })

  return createGraph(filename.replace(/\.[^/.]+$/, ''), false, nodes, edges)
}

export default router