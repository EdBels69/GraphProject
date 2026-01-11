import { Graph } from '../contracts/graph'
import { cacheManager } from '../../api/core/CacheManager'

export interface CommunityResult {
    communities: Map<string, number>
    modularity: number
    communityNodes: Map<number, string[]>
}

export interface GapAnalysisResult {
    sparseAreas: Array<{ nodes: string[]; density: number; suggestion: string }>
    bridgeOpportunities: Array<{ community1: number; community2: number; potentialLinks: Array<{ source: string; target: string }> }>
    isolatedNodes: string[]
}

export class CommunityDetector {
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

    detectCommunities(): CommunityResult {
        const cacheKey = this.getCacheKey('communities')
        const cached = this.getCached<CommunityResult>(cacheKey)
        if (cached) return cached

        const communities = new Map<string, number>()
        this.graph.nodes.forEach((node, index) => {
            communities.set(node.id, index)
        })

        const adjacency = this.buildAdjacencyList()
        const m = this.graph.edges.length || 1

        const degree = new Map<string, number>()
        this.graph.nodes.forEach(node => {
            degree.set(node.id, adjacency.get(node.id)?.size || 0)
        })

        let improved = true
        let maxIterations = 50

        while (improved && maxIterations > 0) {
            improved = false
            maxIterations--

            for (const node of this.graph.nodes) {
                const currentCommunity = communities.get(node.id)!
                const neighbors = adjacency.get(node.id) || new Map()

                const neighborCommunities = new Set<number>()
                neighbors.forEach((_, neighborId) => {
                    neighborCommunities.add(communities.get(neighborId)!)
                })

                let bestCommunity = currentCommunity
                let bestGain = 0

                for (const targetCommunity of neighborCommunities) {
                    if (targetCommunity === currentCommunity) continue

                    let linksToTarget = 0
                    neighbors.forEach((_, neighborId) => {
                        if (communities.get(neighborId) === targetCommunity) {
                            linksToTarget++
                        }
                    })

                    const gain = linksToTarget / m
                    if (gain > bestGain) {
                        bestGain = gain
                        bestCommunity = targetCommunity
                    }
                }

                if (bestCommunity !== currentCommunity) {
                    communities.set(node.id, bestCommunity)
                    improved = true
                }
            }
        }

        const uniqueCommunities = new Set(communities.values())
        const communityMapping = new Map<number, number>()
        let newId = 0
        uniqueCommunities.forEach(oldId => {
            communityMapping.set(oldId, newId++)
        })

        communities.forEach((oldCommunity, nodeId) => {
            communities.set(nodeId, communityMapping.get(oldCommunity)!)
        })

        const communityNodes = new Map<number, string[]>()
        communities.forEach((community, nodeId) => {
            if (!communityNodes.has(community)) {
                communityNodes.set(community, [])
            }
            communityNodes.get(community)!.push(nodeId)
        })

        let modularity = 0
        this.graph.edges.forEach(edge => {
            const ci = communities.get(edge.source)
            const cj = communities.get(edge.target)
            if (ci === cj) {
                const ki = degree.get(edge.source) || 0
                const kj = degree.get(edge.target) || 0
                modularity += 1 - (ki * kj) / (2 * m)
            }
        })
        modularity /= (2 * m)

        const result = { communities, modularity, communityNodes }
        this.setCached(cacheKey, result, 15 * 60 * 1000)
        return result
    }

    detectGaps(): GapAnalysisResult {
        const cacheKey = this.getCacheKey('gaps')
        const cached = this.getCached<GapAnalysisResult>(cacheKey)
        if (cached) return cached

        const adjacency = this.buildAdjacencyList()
        const { communities, communityNodes } = this.detectCommunities()

        const isolatedNodes: string[] = []
        this.graph.nodes.forEach(node => {
            const neighbors = adjacency.get(node.id)
            if (!neighbors || neighbors.size <= 1) {
                isolatedNodes.push(node.id)
            }
        })

        const sparseAreas: Array<{ nodes: string[]; density: number; suggestion: string }> = []

        communityNodes.forEach((nodes, communityId) => {
            if (nodes.length < 2) return

            let internalEdges = 0
            this.graph.edges.forEach(edge => {
                if (communities.get(edge.source) === communityId &&
                    communities.get(edge.target) === communityId) {
                    internalEdges++
                }
            })

            const maxPossible = nodes.length * (nodes.length - 1) / 2
            const density = maxPossible > 0 ? internalEdges / maxPossible : 0

            if (density < 0.3 && nodes.length >= 3) {
                const nodeLabels = nodes.map(id =>
                    this.graph.nodes.find(n => n.id === id)?.label || id
                ).slice(0, 5)

                sparseAreas.push({
                    nodes,
                    density,
                    suggestion: `Research gap: sparse connections between ${nodeLabels.join(', ')}. Consider investigating relationships.`
                })
            }
        })

        const bridgeOpportunities: Array<{
            community1: number
            community2: number
            potentialLinks: Array<{ source: string; target: string }>
        }> = []

        const communityList = Array.from(communityNodes.keys())
        for (let i = 0; i < communityList.length; i++) {
            for (let j = i + 1; j < communityList.length; j++) {
                const c1 = communityList[i]
                const c2 = communityList[j]

                let crossEdges = 0
                this.graph.edges.forEach(edge => {
                    const sourceCommunity = communities.get(edge.source)
                    const targetCommunity = communities.get(edge.target)
                    if ((sourceCommunity === c1 && targetCommunity === c2) ||
                        (sourceCommunity === c2 && targetCommunity === c1)) {
                        crossEdges++
                    }
                })

                const nodes1 = communityNodes.get(c1) || []
                const nodes2 = communityNodes.get(c2) || []
                const maxCrossEdges = nodes1.length * nodes2.length

                if (crossEdges < maxCrossEdges * 0.1 && nodes1.length >= 2 && nodes2.length >= 2) {
                    const topNodes1 = nodes1
                        .map(id => ({ id, degree: adjacency.get(id)?.size || 0 }))
                        .sort((a, b) => b.degree - a.degree)
                        .slice(0, 2)
                        .map(n => n.id)

                    const topNodes2 = nodes2
                        .map(id => ({ id, degree: adjacency.get(id)?.size || 0 }))
                        .sort((a, b) => b.degree - a.degree)
                        .slice(0, 2)
                        .map(n => n.id)

                    const potentialLinks: Array<{ source: string; target: string }> = []
                    topNodes1.forEach(source => {
                        topNodes2.forEach(target => {
                            potentialLinks.push({ source, target })
                        })
                    })

                    bridgeOpportunities.push({ community1: c1, community2: c2, potentialLinks })
                }
            }
        }

        const result = { sparseAreas, bridgeOpportunities, isolatedNodes }
        this.setCached(cacheKey, result, 15 * 60 * 1000)
        return result
    }
}
