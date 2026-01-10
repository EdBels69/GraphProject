import { Graph } from '../../shared/contracts/graph'
import { GraphAnalyzer } from '../../shared/graphAlgorithms'
import { databaseManager } from '../core/Database'
import { logger } from '../core/Logger'
import { AppError } from '../utils/errors'

class GraphRuntimeService {
    private static instance: GraphRuntimeService
    private graphsStore: Map<string, Graph> = new Map()
    private analyzers: Map<string, GraphAnalyzer> = new Map()
    private isInitialized = false

    private constructor() { }

    static getInstance(): GraphRuntimeService {
        if (!GraphRuntimeService.instance) {
            GraphRuntimeService.instance = new GraphRuntimeService()
        }
        return GraphRuntimeService.instance
    }

    async initialize() {
        if (this.isInitialized) return

        // Ensure DB is initialized
        await databaseManager.initialize()
        this.isInitialized = true
    }

    private async loadGraphsFromDb(userId: string) {
        try {
            const graphs = await databaseManager.getAllGraphs(userId)
            graphs.forEach(graph => {
                this.graphsStore.set(graph.id, graph)
                const analyzer = new GraphAnalyzer(graph)
                this.analyzers.set(graph.id, analyzer)
            })
            logger.info('GraphRuntime', `Loaded ${graphs.length} graphs from database`)
        } catch (error) {
            logger.error('GraphRuntime', 'Failed to load graphs from database', { error })
        }
    }

    getGraph(id: string): Graph | undefined {
        return this.graphsStore.get(id)
    }

    async getOrLoadGraph(id: string, userId: string): Promise<Graph> {
        let graph = this.graphsStore.get(id)

        // If graph is in memory, verify owner
        if (graph && (graph as any).userId !== userId) {
            logger.warn('GraphRuntime', `Access denied to graph ${id} for user ${userId}`)
            throw AppError.forbidden('Access to this graph is denied')
        }

        if (!graph) {
            // Lazy load from DB
            const fromDb = await databaseManager.getGraphFromDb(id, userId)
            if (!fromDb) {
                logger.warn('GraphRuntime', `Graph ${id} not found in DB for user ${userId}`)
                throw AppError.notFound(`Graph ${id} not found`)
            }
            this.setGraph(fromDb)
            graph = fromDb
        }
        return graph
    }

    setGraph(graph: Graph) {
        this.graphsStore.set(graph.id, graph)
        const analyzer = new GraphAnalyzer(graph)
        this.analyzers.set(graph.id, analyzer)
    }

    deleteGraph(id: string): boolean {
        const deleted = this.graphsStore.delete(id)
        if (deleted) {
            this.analyzers.delete(id)
        }
        return deleted
    }

    getAnalyzer(id: string): GraphAnalyzer {
        let analyzer = this.analyzers.get(id)
        if (!analyzer) {
            const graph = this.graphsStore.get(id)
            if (!graph) {
                throw AppError.internal(`Graph ${id} must be loaded before accessing analyzer`)
            }
            analyzer = new GraphAnalyzer(graph)
            this.analyzers.set(id, analyzer)
        }
        return analyzer
    }

    async getAllGraphs(userId: string): Promise<Graph[]> {
        // Return from memory if all graphs for this user are already there?
        // Simpler for now: just fetch from DB to be safe, or filter memory.
        const dbGraphs = await databaseManager.getAllGraphs(userId)
        dbGraphs.forEach(g => this.setGraph(g))
        return dbGraphs
    }
}

export const graphRuntime = GraphRuntimeService.getInstance()
