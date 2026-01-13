import { Graph } from '../contracts/graph'
import { CentralityResult } from '../contracts/analysis'
import { PathFinder } from './PathFinder'
import { cacheManager } from '../../api/core/CacheManager'

export class CentralityCalculator {
    private pathFinder: PathFinder

    constructor(
        private graph: Graph,
        private cachePrefix: string
    ) {
        this.pathFinder = new PathFinder(graph, cachePrefix)
    }

    private getCacheKey(operation: string, params?: string): string {
        const paramStr = params ? `:${params}` : ''
        return `${this.cachePrefix}${operation}${paramStr}`
    }

    private getCached<T>(key: string): T | null {
        return cacheManager.get<T>(key)
    }

    private setCached<T>(key: string, value: T, ttl?: number): void {
        cacheManager.set<T>(key, value, ttl)
    }

    private buildAdjacencyList(): Map<string, Map<string, number>> {
        const adjacency = new Map<string, Map<string, number>>()

        this.graph.nodes.forEach(node => {
            adjacency.set(node.id, new Map<string, number>())
        })

        this.graph.edges.forEach(edge => {
            const sourceMap = adjacency.get(edge.source)
            if (sourceMap) {
                sourceMap.set(edge.target, edge.properties.weight || 1)
            }
        })

        if (!this.graph.directed) {
            this.graph.edges.forEach(edge => {
                const targetMap = adjacency.get(edge.target)
                if (targetMap) {
                    targetMap.set(edge.source, edge.properties.weight || 1)
                }
            })
        }

        return adjacency
    }

    calculateCentrality(): CentralityResult[] {
        const cacheKey = this.getCacheKey('centrality')
        const cached = this.getCached<CentralityResult[]>(cacheKey)

        if (cached) {
            return cached
        }

        const adjacency = this.buildAdjacencyList()
        const results: CentralityResult[] = []

        const n = this.graph.nodes.length
        const totalNodes = n

        this.graph.nodes.forEach(node => {
            const nodeId = node.id
            const neighbors = adjacency.get(nodeId)

            const degree = neighbors ? neighbors.size : 0
            const avgDegree = 2 * this.graph.edges.length / totalNodes

            let betweenness = 0
            this.graph.nodes.forEach(source => {
                this.graph.nodes.forEach(target => {
                    if (source.id !== target.id && source.id !== nodeId && target.id !== nodeId) {
                        const path = this.pathFinder.findShortestPath(source.id, target.id)
                        if (path && path.path.includes(nodeId)) {
                            betweenness += 1
                        }
                    }
                })
            })

            const maxPossibleBetweenness = (totalNodes - 1) * (totalNodes - 2) / 2
            betweenness = maxPossibleBetweenness > 0 ? betweenness / maxPossibleBetweenness : 0

            let closeness = 0
            this.graph.nodes.forEach(otherNode => {
                if (otherNode.id !== nodeId) {
                    const path = this.pathFinder.findShortestPath(nodeId, otherNode.id)
                    if (path) {
                        closeness += path.length
                    }
                }
            })

            closeness = closeness > 0 ? (totalNodes - 1) / closeness : 0

            let eigenvector = avgDegree > 0 ? degree / avgDegree : 0


            results.push({
                nodeId,
                nodeName: node?.label || nodeId,
                nodeType: node?.type || 'concept',
                degree,
                betweenness,
                closeness,
                eigenvector,
                pagerank: 0,
                rank: 0
            })
        })

        this.setCached(cacheKey, results, 15 * 60 * 1000)

        return results
    }

    calculatePageRank(dampingFactor: number = 0.85, iterations: number = 100): Map<string, number> {
        const cacheKey = this.getCacheKey('pagerank', `d${dampingFactor}-i${iterations}`)
        const cached = this.getCached<Map<string, number>>(cacheKey)
        if (cached) return cached

        const n = this.graph.nodes.length
        if (n === 0) return new Map()

        const pageRank = new Map<string, number>()
        const outDegree = new Map<string, number>()

        this.graph.nodes.forEach(node => {
            pageRank.set(node.id, 1 / n)
            outDegree.set(node.id, 0)
        })

        this.graph.edges.forEach(edge => {
            outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1)
            if (!this.graph.directed) {
                outDegree.set(edge.target, (outDegree.get(edge.target) || 0) + 1)
            }
        })

        const incomingEdges = new Map<string, string[]>()
        this.graph.nodes.forEach(node => incomingEdges.set(node.id, []))

        this.graph.edges.forEach(edge => {
            incomingEdges.get(edge.target)?.push(edge.source)
            if (!this.graph.directed) {
                incomingEdges.get(edge.source)?.push(edge.target)
            }
        })

        for (let iter = 0; iter < iterations; iter++) {
            const newRank = new Map<string, number>()
            const teleport = (1 - dampingFactor) / n

            this.graph.nodes.forEach(node => {
                let sum = 0
                const incoming = incomingEdges.get(node.id) || []

                incoming.forEach(sourceId => {
                    const sourceOutDegree = outDegree.get(sourceId) || 1
                    sum += (pageRank.get(sourceId) || 0) / sourceOutDegree
                })

                newRank.set(node.id, teleport + dampingFactor * sum)
            })

            newRank.forEach((rank, nodeId) => pageRank.set(nodeId, rank))
        }

        this.setCached(cacheKey, pageRank, 15 * 60 * 1000)
        return pageRank
    }
}
