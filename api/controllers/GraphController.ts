import { Request, Response } from 'express'
import {
    Graph,
    createGraph,
    createNode,
    createEdge
} from '../../shared/contracts/graph'
import { graphRuntime } from '../services/GraphRuntimeService'
import { databaseManager } from '../../src/core/Database'
import GraphStorage from '../../shared/graphStorage'
import { validateGraph, validateFileUpload } from '../../src/utils/validators'
import { logger } from '../../src/core/Logger'
import { generateGEXF, generatePDF } from '../utils/graphExports'
import { parseCSV, parseBibTeX } from '../utils/fileParsing'
import { researchAgent } from '../services/ResearchAgentService'

function buildGraphFromData(data: any, filename: string): Graph {
    const graph = createGraph(filename.split('.')[0] || 'Uploaded Graph', false)
    if (data.articles && Array.isArray(data.articles)) {
        data.articles.forEach((article: any) => {
            const title = article.title || article.id || 'Untitled'
            const nodeId = article.id || `node-${Math.random().toString(36).substr(2, 9)}`
            const node = createNode(nodeId, title, 'concept', {
                type: 'article',
                ...article
            })
            graph.nodes.push(node)
            if (article.authors) {
                const authors = Array.isArray(article.authors) ? article.authors : [article.authors]
                authors.forEach((author: string) => {
                    if (!author) return
                    const authorId = `author-${author.replace(/\s+/g, '_')}`
                    if (!graph.nodes.find(n => n.id === authorId)) {
                        graph.nodes.push(createNode(authorId, author, 'person', { type: 'person' }))
                    }
                    graph.edges.push(createEdge(
                        `edge-${node.id}-${authorId}`,
                        authorId,
                        node.id,
                        1,
                        { type: 'authored' }
                    ))
                })
            }
        })
    }
    return graph
}

export class GraphController {

    static async getAll(req: Request, res: Response) {
        try {
            const dbGraphs = await databaseManager.getAllGraphs()
            dbGraphs.forEach(g => graphRuntime.setGraph(g))
            res.json({ success: true, data: dbGraphs, count: dbGraphs.length })
        } catch (error) {
            logger.error('GraphController', 'Failed to fetch graphs', { error })
            res.status(500).json({ success: false, error: 'Failed to fetch graphs' })
        }
    }

    static async getById(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: graph })
    }

    static async create(req: Request, res: Response) {
        const { name, directed = false } = req.body
        if (!name || typeof name !== 'string') return res.status(400).json({ success: false, error: 'Name required' })
        const graph = createGraph(name, directed)
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph).catch(err => logger.error('GraphController', 'DB Save failed', { error: err }))
        res.status(201).json({ success: true, data: graph })
    }

    static async update(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        const { name, directed } = req.body
        if (name !== undefined) graph.name = name
        if (directed !== undefined) graph.directed = directed
        graph.updatedAt = new Date().toISOString()
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph).catch(err => logger.error('GraphController', 'DB Update failed', { error: err }))
        res.json({ success: true, data: graph })
    }

    static async delete(req: Request, res: Response) {
        const { id } = req.params
        const deleted = graphRuntime.deleteGraph(id)
        if (deleted) {
            GraphStorage.delete(id)
            databaseManager.deleteGraph(id).catch(err => logger.error('GraphController', 'DB Delete failed', { error: err }))
            res.json({ success: true, message: 'Deleted' })
        } else {
            res.status(404).json({ success: false, error: 'Graph not found' })
        }
    }

    // --- Nodes & Edges ---
    static async getNodes(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: graph.nodes, count: graph.nodes.length })
    }

    static async addNode(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        const { label, weight } = req.body
        if (!label || typeof label !== 'string') return res.status(400).json({ success: false, error: 'Label required' })
        const nodeId = `node-${Date.now()}`
        const node = createNode(nodeId, label, 'concept', {}, weight)
        graph.nodes.push(node)
        graph.updatedAt = new Date().toISOString()
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        res.status(201).json({ success: true, data: node })
    }

    static async deleteNode(req: Request, res: Response) {
        const { graphId, nodeId } = req.params
        const graph = await graphRuntime.getOrLoadGraph(graphId)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        const initial = graph.nodes.length
        graph.nodes = graph.nodes.filter(n => n.id !== nodeId)
        if (graph.nodes.length === initial) return res.status(404).json({ success: false, error: 'Node not found' })
        // Also remove incident edges
        graph.edges = graph.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
        graph.updatedAt = new Date().toISOString()
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        res.json({ success: true, message: 'Node deleted' })
    }

    static async getEdges(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: graph.edges, count: graph.edges.length })
    }

    static async addEdge(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        const { source, target, weight } = req.body
        if (!source || !target) return res.status(400).json({ success: false, error: 'Source/Target required' })
        const edgeId = `edge-${Date.now()}`
        const edge = createEdge(edgeId, source, target, weight)
        graph.edges.push(edge)
        graph.updatedAt = new Date().toISOString()
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        res.status(201).json({ success: true, data: edge })
    }

    static async deleteEdge(req: Request, res: Response) {
        const { graphId, edgeId } = req.params
        const graph = await graphRuntime.getOrLoadGraph(graphId)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        const initial = graph.edges.length
        graph.edges = graph.edges.filter(e => e.id !== edgeId)
        if (graph.edges.length === initial) return res.status(404).json({ success: false, error: 'Edge not found' })
        graph.updatedAt = new Date().toISOString()
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        res.json({ success: true, message: 'Edge deleted' })
    }

    // --- Analysis ---
    static async getCentrality(req: Request, res: Response) {
        const { id } = req.params
        const analyzer = graphRuntime.getAnalyzer(id)
        if (!analyzer) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: analyzer.calculateCentrality() })
    }

    static async getShortestPath(req: Request, res: Response) {
        const { id } = req.params
        const { source, target } = req.query
        if (!source || !target) return res.status(400).json({ success: false, error: 'Params required' })
        const analyzer = graphRuntime.getAnalyzer(id)
        if (!analyzer) return res.status(404).json({ success: false, error: 'Graph not found' })
        const result = analyzer.findShortestPath(source as string, target as string)
        if (!result) return res.status(404).json({ success: false, error: 'No path' })
        res.json({ success: true, data: result })
    }

    static async getAllShortestPaths(req: Request, res: Response) {
        const { id } = req.params
        const analyzer = graphRuntime.getAnalyzer(id)
        if (!analyzer) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: analyzer.findAllShortestPaths() })
    }

    static async checkConnectivity(req: Request, res: Response) {
        const { id } = req.params
        const analyzer = graphRuntime.getAnalyzer(id)
        if (!analyzer) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: analyzer.checkConnectivity() })
    }

    static async getStatistics(req: Request, res: Response) {
        const { id } = req.params
        const analyzer = graphRuntime.getAnalyzer(id)
        if (!analyzer) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: analyzer.calculateStatistics() })
    }

    static async validate(req: Request, res: Response) {
        const { id } = req.params
        const analyzer = graphRuntime.getAnalyzer(id)
        if (!analyzer) return res.status(404).json({ success: false, error: 'Graph not found' })
        res.json({ success: true, data: analyzer.validate() })
    }

    static async research(req: Request, res: Response) {
        const { id } = req.params
        const { query } = req.body
        if (!query) return res.status(400).json({ success: false, error: 'Query required' })

        try {
            const result = await researchAgent.researchTopic(id, query)
            res.json({ success: true, data: result })
        } catch (error) {
            logger.error('GraphController', 'Research failed', { error })
            res.status(500).json({ success: false, error: 'Research failed' })
        }
    }

    // --- Exports ---
    static async exportGEXF(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        const gexf = generateGEXF(graph)
        res.setHeader('Content-Type', 'application/xml')
        res.setHeader('Content-Disposition', `attachment; filename="${graph.name}.gexf"`)
        res.send(gexf)
    }

    static async exportPDF(req: Request, res: Response) {
        const { id } = req.params
        const graph = await graphRuntime.getOrLoadGraph(id)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        try {
            const pdfBuffer = await generatePDF(graph)
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="${graph.name}.pdf"`)
            res.send(pdfBuffer)
        } catch (error) {
            logger.error('GraphController', 'PDF Gen failed', { error })
            res.status(500).json({ success: false, error: 'PDF Generation failed' })
        }
    }

    // --- Upload ---
    static async upload(req: any, res: Response) {
        try {
            if (!req.file) return res.status(400).json({ success: false, error: 'No file' })
            const file = req.file
            const validation = validateFileUpload(file)
            if (!validation.valid) return res.status(400).json({ success: false, errors: validation.errors })

            const content = file.buffer.toString('utf-8')
            let parsedData
            const ext = file.originalname.split('.').pop()?.toLowerCase() || ''

            if (ext === 'json') parsedData = JSON.parse(content)
            else if (ext === 'csv') parsedData = parseCSV(content)
            else if (['bib', 'txt'].includes(ext)) parsedData = parseBibTeX(content)
            else return res.status(400).json({ success: false, error: 'Unsupported format' })

            let graph: Graph
            if (parsedData.nodes && parsedData.edges) {
                graph = {
                    ...createGraph(file.originalname.split('.')[0] || 'Imported', false),
                    nodes: parsedData.nodes,
                    edges: parsedData.edges,
                    directed: parsedData.directed || false,
                    metadata: parsedData.metadata
                }
                const gVal = validateGraph(graph)
                if (!gVal.valid) return res.status(400).json({ success: false, errors: gVal.errors })
            } else {
                graph = buildGraphFromData(parsedData, file.originalname)
            }

            graphRuntime.setGraph(graph)
            GraphStorage.save(graph)
            await databaseManager.saveGraphToDb(graph)

            res.status(201).json({
                success: true,
                data: { graph, stats: { totalNodes: graph.nodes.length, totalEdges: graph.edges.length } }
            })
        } catch (error) {
            logger.error('GraphController', 'Upload failed', { error })
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }
}
