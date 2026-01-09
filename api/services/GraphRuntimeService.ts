import { Graph } from '../../shared/contracts/graph'
import { GraphAnalyzer } from '../../shared/graphAlgorithms'
import { databaseManager } from '../../src/core/Database'
import { logger } from '../../src/core/Logger'

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

        await this.loadGraphsFromDb()
        this.isInitialized = true
    }

    private async loadGraphsFromDb() {
        try {
            const graphs = await databaseManager.getAllGraphs()
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

    async getOrLoadGraph(id: string): Promise<Graph | undefined> {
        let graph = this.graphsStore.get(id)
        if (!graph) {
            // Try DB fallback (lazy load if not in memory)
            const fromDb = await databaseManager.getGraphFromDb(id)
            if (fromDb) {
                this.setGraph(fromDb)
                graph = fromDb
            }
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

    getAnalyzer(id: string): GraphAnalyzer | undefined {
        // Ensure analyzer exists if graph exists
        let analyzer = this.analyzers.get(id)
        if (!analyzer) {
            const graph = this.graphsStore.get(id)
            if (graph) {
                analyzer = new GraphAnalyzer(graph)
                this.analyzers.set(id, analyzer)
            }
        }
        return analyzer
    }

    getAllGraphs(): Graph[] {
        return Array.from(this.graphsStore.values())
    }
}

export const graphRuntime = GraphRuntimeService.getInstance()
