import { Graph } from '../contracts/graph'
import { PathResult } from '../contracts/analysis'
import { cacheManager } from '../../api/core/CacheManager'

export class PathFinder {
    constructor(
        private graph: Graph,
        private cachePrefix: string
    ) { }

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
                sourceMap.set(edge.target, edge.weight || 1)
            }
        })

        if (!this.graph.directed) {
            this.graph.edges.forEach(edge => {
                const targetMap = adjacency.get(edge.target)
                if (targetMap) {
                    targetMap.set(edge.source, edge.weight || 1)
                }
            })
        }

        return adjacency
    }

    findShortestPath(startId: string, endId: string): PathResult | null {
        const cacheKey = this.getCacheKey('shortestPath', `${startId}-${endId}`)
        const cached = this.getCached<PathResult>(cacheKey)

        if (cached) {
            return cached
        }

        const adjacency = this.buildAdjacencyList()
        const distances = new Map<string, number>()
        const previous = new Map<string, string | null>()
        const unvisited = new Set<string>(this.graph.nodes.map(n => n.id))

        this.graph.nodes.forEach(node => {
            distances.set(node.id, Infinity)
        })

        distances.set(startId, 0)

        while (unvisited.size > 0) {
            let currentNode: string | null = null
            let minDistance = Infinity

            unvisited.forEach(nodeId => {
                const distance = distances.get(nodeId) ?? Infinity
                if (distance < minDistance) {
                    minDistance = distance
                    currentNode = nodeId
                }
            })

            if (currentNode === null || minDistance === Infinity) {
                break
            }

            if (currentNode === endId) {
                break
            }

            unvisited.delete(currentNode)

            const neighbors = adjacency.get(currentNode)
            if (neighbors) {
                neighbors.forEach((weight, neighborId) => {
                    const newDistance = (distances.get(currentNode!) ?? 0) + weight
                    if (newDistance < (distances.get(neighborId) ?? Infinity)) {
                        distances.set(neighborId, newDistance)
                        previous.set(neighborId, currentNode!)
                    }
                })
            }
        }

        const totalDistance = distances.get(endId)
        if (totalDistance === undefined || totalDistance === Infinity) {
            return null
        }

        const path: string[] = []
        let current: string | null = endId

        while (current !== null) {
            path.unshift(current)
            current = previous.get(current) || null
        }

        const result = {
            source: startId,
            target: endId,
            path,
            totalWeight: totalDistance,
            length: path.length
        }

        this.setCached(cacheKey, result, 10 * 60 * 1000)

        return result
    }

    findAllShortestPaths(): Map<string, Map<string, PathResult>> {
        const allPaths = new Map<string, Map<string, PathResult>>()

        for (let i = 0; i < this.graph.nodes.length; i++) {
            for (let j = i + 1; j < this.graph.nodes.length; j++) {
                const startNode = this.graph.nodes[i]
                const endNode = this.graph.nodes[j]
                const result = this.findShortestPath(startNode.id, endNode.id)

                if (result) {
                    if (!allPaths.has(startNode.id)) {
                        allPaths.set(startNode.id, new Map<string, PathResult>())
                    }
                    allPaths.get(startNode.id)!.set(endNode.id, result)
                }
            }
        }

        return allPaths
    }
}
