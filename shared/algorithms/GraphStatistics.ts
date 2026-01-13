import { Graph } from '../contracts/graph'
import { GraphStatistics as IGraphStatistics, ConnectivityResult } from '../contracts/analysis'
import { PathFinder } from './PathFinder'

export class GraphStatistics {
    private pathFinder: PathFinder

    constructor(
        private graph: Graph,
        private cachePrefix: string
    ) {
        this.pathFinder = new PathFinder(graph, cachePrefix)
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

    checkConnectivity(): ConnectivityResult {
        const adjacency = this.buildAdjacencyList()
        const visited = new Set<string>()
        const components: string[][] = []

        this.graph.nodes.forEach(node => {
            if (!visited.has(node.id)) {
                const component: string[] = []
                const queue: string[] = [node.id]
                visited.add(node.id)

                while (queue.length > 0) {
                    const current = queue.shift()!
                    component.push(current)

                    const neighbors = adjacency.get(current)
                    if (neighbors) {
                        neighbors.forEach((_, neighborId) => {
                            if (!visited.has(neighborId)) {
                                visited.add(neighborId)
                                queue.push(neighborId)
                            }
                        })
                    }
                }

                components.push(component)
            }
        })

        const connected = components.length === 1
        const largestComponent = Math.max(...components.map(c => c.length))

        return {
            connected,
            components: components.length,
            largestComponent
        }
    }

    calculateStatistics(): IGraphStatistics {
        const totalNodes = this.graph.nodes.length
        const totalEdges = this.graph.edges.length

        let totalDegree = 0
        this.graph.nodes.forEach(node => {
            const neighbors = this.graph.edges.filter(
                e => e.source === node.id || e.target === node.id
            )
            totalDegree += neighbors.length
        })

        const averageDegree = totalNodes > 0 ? totalDegree / totalNodes : 0

        const maxPossibleEdges = this.graph.directed
            ? totalNodes * (totalNodes - 1)
            : totalNodes * (totalNodes - 1) / 2

        const density = maxPossibleEdges > 0 ? totalEdges / maxPossibleEdges : 0

        const connectivity = this.checkConnectivity()

        let diameter = 0
        let totalPathLength = 0
        let pathCount = 0

        if (connectivity.connected) {
            this.graph.nodes.forEach((source, i) => {
                this.graph.nodes.forEach((target, j) => {
                    if (i < j) {
                        const path = this.pathFinder.findShortestPath(source.id, target.id)
                        if (path) {
                            diameter = Math.max(diameter, path.length - 1)
                            totalPathLength += path.length - 1
                            pathCount++
                        }
                    }
                })
            })
        }

        const averagePathLength = pathCount > 0 ? totalPathLength / pathCount : 0

        let totalTriangles = 0
        this.graph.nodes.forEach(node => {
            const neighbors = this.graph.edges.filter(
                e => e.source === node.id || e.target === node.id
            ).map(e => e.source === node.id ? e.target : e.source)

            for (let i = 0; i < neighbors.length; i++) {
                for (let j = i + 1; j < neighbors.length; j++) {
                    const edgeExists = this.graph.edges.some(
                        e =>
                            (e.source === neighbors[i] && e.target === neighbors[j]) ||
                            (e.target === neighbors[i] && e.source === neighbors[j])
                    )
                    if (edgeExists) {
                        totalTriangles++
                    }
                }
            }
        })

        const maxPossibleTriangles = totalNodes * (totalNodes - 1) * (totalNodes - 2) / 6
        const clusteringCoefficient = maxPossibleTriangles > 0
            ? (totalTriangles / 3) / maxPossibleTriangles
            : 0

        return {
            totalNodes,
            totalEdges,
            density,
            averageDegree,
            diameter,
            averagePathLength,
            clusteringCoefficient
        }
    }
}
