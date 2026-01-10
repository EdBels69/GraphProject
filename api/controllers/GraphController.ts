import { Request, Response } from 'express'
import {
    Graph,
    createGraph,
    createNode,
    createEdge
} from '../../shared/contracts/graph'
import { graphRuntime } from '../services/GraphRuntimeService'
import { databaseManager } from '../../api/core/Database'
import GraphStorage from '../../shared/graphStorage'
import { validateGraph, validateFileUpload } from '../../src/utils/validators'
import { parseCSV, parseBibTeX } from '../utils/fileParsing'
import { researchAgent } from '../services/ResearchAgentService'
import { ApiResponse } from '../utils/response'
import { AppError, ErrorCode } from '../utils/errors'
import { logger } from '../../api/core/Logger'
import { generateGEXF, generatePDF } from '../utils/graphExports'

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

    static async getAll(req: any, res: Response) {
        const userId = req.user.id
        const dbGraphs = await graphRuntime.getAllGraphs(userId)
        return ApiResponse.success(res, dbGraphs, 200, { count: dbGraphs.length })
    }

    static async getById(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        return ApiResponse.success(res, graph)
    }

    static async create(req: any, res: Response) {
        const { name, directed = false } = req.body
        const userId = req.user.id
        if (!name || typeof name !== 'string') throw AppError.badRequest('Name required')

        const graph = createGraph(name, directed)
            ; (graph as any).userId = userId

        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph).catch(err => logger.error('GraphController', 'DB Save failed', { error: err }))
        return ApiResponse.success(res, graph, 201)
    }

    static async update(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)

        const { name, directed } = req.body
        if (name !== undefined) graph.name = name
        if (directed !== undefined) graph.directed = directed
        graph.updatedAt = new Date().toISOString()

        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph).catch(err => logger.error('GraphController', 'DB Update failed', { error: err }))
        return ApiResponse.success(res, graph)
    }

    static async delete(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id

        // Ensure ownership before delete
        await graphRuntime.getOrLoadGraph(id, userId)

        const deleted = graphRuntime.deleteGraph(id)
        if (deleted) {
            GraphStorage.delete(id)
            databaseManager.deleteGraph(id, userId).catch(err => logger.error('GraphController', 'DB Delete failed', { error: err }))
            return ApiResponse.success(res, { message: 'Deleted' })
        } else {
            throw AppError.notFound(`Graph ${id} not found`)
        }
    }

    // --- Nodes & Edges ---
    static async getNodes(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        return ApiResponse.success(res, graph.nodes, 200, { count: graph.nodes.length })
    }

    static async addNode(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)

        const { label, weight } = req.body
        if (!label || typeof label !== 'string') throw AppError.badRequest('Label required')

        const nodeId = `node-${Date.now()}`
        const node = createNode(nodeId, label, 'concept', {}, weight)
        graph.nodes.push(node)
        graph.updatedAt = new Date().toISOString()

        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        return ApiResponse.success(res, node, 201)
    }

    static async deleteNode(req: any, res: Response) {
        const { graphId, nodeId } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(graphId, userId)

        const initial = graph.nodes.length
        graph.nodes = graph.nodes.filter(n => n.id !== nodeId)
        if (graph.nodes.length === initial) throw AppError.notFound(`Node ${nodeId} not found`)

        // Also remove incident edges
        graph.edges = graph.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
        graph.updatedAt = new Date().toISOString()

        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        return ApiResponse.success(res, { message: 'Node deleted' })
    }

    static async getEdges(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        return ApiResponse.success(res, graph.edges, 200, { count: graph.edges.length })
    }

    static async addEdge(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)

        const { source, target, weight } = req.body
        if (!source || !target) throw AppError.badRequest('Source/Target required')

        const edgeId = `edge-${Date.now()}`
        const edge = createEdge(edgeId, source, target, weight)
        graph.edges.push(edge)
        graph.updatedAt = new Date().toISOString()

        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        return ApiResponse.success(res, edge, 201)
    }

    static async deleteEdge(req: any, res: Response) {
        const { graphId, edgeId } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(graphId, userId)

        const initial = graph.edges.length
        graph.edges = graph.edges.filter(e => e.id !== edgeId)
        if (graph.edges.length === initial) throw AppError.notFound(`Edge ${edgeId} not found`)

        graph.updatedAt = new Date().toISOString()
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        databaseManager.saveGraphToDb(graph)
        return ApiResponse.success(res, { message: 'Edge deleted' })
    }

    // --- Analysis ---
    static async getCentrality(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        const analyzer = graphRuntime.getAnalyzer(graph.id)
        return ApiResponse.success(res, analyzer.calculateCentrality())
    }

    static async getShortestPath(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const { source, target } = req.query
        if (!source || !target) throw AppError.badRequest('Params source and target required')

        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        const analyzer = graphRuntime.getAnalyzer(graph.id)
        const result = analyzer.findShortestPath(source as string, target as string)
        if (!result) throw AppError.notFound('No path found')
        return ApiResponse.success(res, result)
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

    static async getStatistics(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        const analyzer = graphRuntime.getAnalyzer(graph.id)
        return ApiResponse.success(res, analyzer.calculateStatistics())
    }

    static async validate(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        const analyzer = graphRuntime.getAnalyzer(graph.id)
        return ApiResponse.success(res, analyzer.validate())
    }

    static async research(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const { query } = req.body
        if (!query) throw AppError.badRequest('Query required')

        await graphRuntime.getOrLoadGraph(id, userId)
        const result = await researchAgent.researchTopic(id, query, userId)
        return ApiResponse.success(res, result)
    }

    // --- Exports ---
    static async exportGEXF(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)
        if (!graph) return res.status(404).json({ success: false, error: 'Graph not found' })
        const gexf = generateGEXF(graph)
        res.setHeader('Content-Type', 'application/xml')
        res.setHeader('Content-Disposition', `attachment; filename="${graph.name}.gexf"`)
        res.send(gexf)
    }

    static async exportPDF(req: any, res: Response) {
        const { id } = req.params
        const userId = req.user.id
        const graph = await graphRuntime.getOrLoadGraph(id, userId)

        const pdfBuffer = await generatePDF(graph)
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${graph.name}.pdf"`)
        res.send(pdfBuffer)
    }

    // --- Upload ---
    static async upload(req: any, res: Response) {
        const userId = req.user.id
        if (!req.file) throw AppError.badRequest('No file uploaded')

        const file = req.file
        const validation = validateFileUpload(file)
        if (!validation.valid) throw AppError.validation(JSON.stringify(validation.errors))

        const content = file.buffer.toString('utf-8')
        let parsedData
        let graph: Graph
        const ext = file.originalname.split('.').pop()?.toLowerCase() || ''

        if (ext === 'json') parsedData = JSON.parse(content)
        else if (ext === 'csv') parsedData = parseCSV(content)
        else if (['bib', 'txt'].includes(ext)) parsedData = parseBibTeX(content)
        else throw AppError.badRequest('Unsupported format')

        if (parsedData.nodes && parsedData.edges) {
            const graphId = `graph-${Date.now()}`
            graph = {
                ...createGraph(file.originalname.split('.')[0] || 'Imported', false),
                id: graphId,
                nodes: parsedData.nodes,
                edges: parsedData.edges,
                directed: parsedData.directed || false,
                metadata: parsedData.metadata || {}
            } as Graph
                ; (graph as any).userId = userId
            const gVal = validateGraph(graph)
            if (!gVal.valid) throw AppError.validation(JSON.stringify(gVal.errors))
        } else {
            graph = buildGraphFromData(parsedData, file.originalname)
                ; (graph as any).userId = userId
        }

        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        await databaseManager.saveGraphToDb(graph)

        return ApiResponse.success(res, {
            graph,
            stats: { totalNodes: graph.nodes.length, totalEdges: graph.edges.length }
        }, 201)
    }
}
