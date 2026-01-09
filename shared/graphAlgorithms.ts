import {
  Graph,
  GraphNode,
  GraphEdge,
  GraphMetrics
} from './contracts/graph'
import {
  CentralityResult,
  PathResult,
  ConnectivityResult,
  GraphStatistics
} from './contracts/analysis'
import { cacheManager } from '../src/core/CacheManager'

export class GraphAnalyzer {
  private graph: Graph
  private cachePrefix: string

  constructor(graph: Graph) {
    this.graph = graph
    this.cachePrefix = `graph:${graph.id}:`
  }

  private getCacheKey(operation: string, params?: string): string {
    const paramStr = params ? `:${params}` : '';
    return `${this.cachePrefix}${operation}${paramStr}`;
  }

  private getCached<T>(key: string): T | null {
    return cacheManager.get<T>(key);
  }

  private setCached<T>(key: string, value: T, ttl?: number): void {
    cacheManager.set<T>(key, value, ttl);
  }

  private invalidateCache(): void {
    cacheManager.clearPattern(`^${this.cachePrefix}`);
  }

  buildAdjacencyList(): Map<string, Map<string, number>> {
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
    const cacheKey = this.getCacheKey('shortestPath', `${startId}-${endId}`);
    const cached = this.getCached<PathResult>(cacheKey);

    if (cached) {
      return cached;
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
        const distance = distances.get(nodeId) || Infinity
        if (distance < minDistance) {
          minDistance = distance
          currentNode = nodeId
        }
      })

      if (currentNode === null || distances.get(currentNode) === Infinity) {
        break
      }

      if (currentNode === endId) {
        break
      }

      unvisited.delete(currentNode)

      const neighbors = adjacency.get(currentNode)
      if (neighbors) {
        neighbors.forEach((weight, neighborId) => {
          const newDistance = (distances.get(currentNode!) || 0) + weight
          if (newDistance < (distances.get(neighborId) || Infinity)) {
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
    };

    this.setCached(cacheKey, result, 10 * 60 * 1000);

    return result;
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

  calculateCentrality(): CentralityResult[] {
    const cacheKey = this.getCacheKey('centrality');
    const cached = this.getCached<CentralityResult[]>(cacheKey);

    if (cached) {
      return cached;
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
            const path = this.findShortestPath(source.id, target.id)
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
          const path = this.findShortestPath(nodeId, otherNode.id)
          if (path) {
            closeness += path.length
          }
        }
      })

      closeness = closeness > 0 ? (totalNodes - 1) / closeness : 0

      let eigenvector = degree / avgDegree


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

    this.setCached(cacheKey, results, 15 * 60 * 1000);

    return results;
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

  calculateStatistics(): GraphStatistics {
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
            const path = this.findShortestPath(source.id, target.id)
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

  addNode(node: GraphNode): void {
    this.graph.nodes.push(node)
    this.graph.updatedAt = new Date().toISOString()
  }

  addEdge(edge: GraphEdge): void {
    this.graph.edges.push(edge)
    this.graph.updatedAt = new Date().toISOString()
  }

  removeNode(nodeId: string): void {
    this.graph.nodes = this.graph.nodes.filter(n => n.id !== nodeId)
    this.graph.edges = this.graph.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )
    this.graph.updatedAt = new Date().toISOString()
  }

  removeEdge(edgeId: string): void {
    this.graph.edges = this.graph.edges.filter(e => e.id !== edgeId)
    this.graph.updatedAt = new Date().toISOString()
  }

  /**
   * Calculate PageRank for all nodes
   * @param dampingFactor - probability of following a link (default 0.85)
   * @param iterations - number of iterations (default 100)
   */
  calculatePageRank(dampingFactor: number = 0.85, iterations: number = 100): Map<string, number> {
    const cacheKey = this.getCacheKey('pagerank', `d${dampingFactor}-i${iterations}`);
    const cached = this.getCached<Map<string, number>>(cacheKey);
    if (cached) return cached;

    const n = this.graph.nodes.length
    if (n === 0) return new Map()

    // Initialize PageRank uniformly
    const pageRank = new Map<string, number>()
    const outDegree = new Map<string, number>()

    this.graph.nodes.forEach(node => {
      pageRank.set(node.id, 1 / n)
      outDegree.set(node.id, 0)
    })

    // Calculate out-degree
    this.graph.edges.forEach(edge => {
      outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1)
      if (!this.graph.directed) {
        outDegree.set(edge.target, (outDegree.get(edge.target) || 0) + 1)
      }
    })

    // Build reverse adjacency (incoming edges)
    const incomingEdges = new Map<string, string[]>()
    this.graph.nodes.forEach(node => incomingEdges.set(node.id, []))

    this.graph.edges.forEach(edge => {
      incomingEdges.get(edge.target)?.push(edge.source)
      if (!this.graph.directed) {
        incomingEdges.get(edge.source)?.push(edge.target)
      }
    })

    // Iterate
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

      // Update ranks
      newRank.forEach((rank, nodeId) => pageRank.set(nodeId, rank))
    }

    this.setCached(cacheKey, pageRank, 15 * 60 * 1000)
    return pageRank
  }

  /**
   * Detect communities using Louvain-like algorithm
   * Returns a map of nodeId -> communityId
   */
  detectCommunities(): { communities: Map<string, number>; modularity: number; communityNodes: Map<number, string[]> } {
    const cacheKey = this.getCacheKey('communities');
    const cached = this.getCached<{ communities: Map<string, number>; modularity: number; communityNodes: Map<number, string[]> }>(cacheKey);
    if (cached) return cached;

    // Initialize: each node is its own community
    const communities = new Map<string, number>()
    this.graph.nodes.forEach((node, index) => {
      communities.set(node.id, index)
    })

    const adjacency = this.buildAdjacencyList()
    const m = this.graph.edges.length || 1 // Total edges (for modularity)

    // Calculate degree for each node
    const degree = new Map<string, number>()
    this.graph.nodes.forEach(node => {
      degree.set(node.id, adjacency.get(node.id)?.size || 0)
    })

    // Iterative community merging
    let improved = true
    let maxIterations = 50

    while (improved && maxIterations > 0) {
      improved = false
      maxIterations--

      for (const node of this.graph.nodes) {
        const currentCommunity = communities.get(node.id)!
        const neighbors = adjacency.get(node.id) || new Map()

        // Find community with best modularity gain
        const neighborCommunities = new Set<number>()
        neighbors.forEach((_, neighborId) => {
          neighborCommunities.add(communities.get(neighborId)!)
        })

        let bestCommunity = currentCommunity
        let bestGain = 0

        for (const targetCommunity of neighborCommunities) {
          if (targetCommunity === currentCommunity) continue

          // Calculate modularity gain (simplified)
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

    // Renumber communities to be consecutive
    const uniqueCommunities = new Set(communities.values())
    const communityMapping = new Map<number, number>()
    let newId = 0
    uniqueCommunities.forEach(oldId => {
      communityMapping.set(oldId, newId++)
    })

    communities.forEach((oldCommunity, nodeId) => {
      communities.set(nodeId, communityMapping.get(oldCommunity)!)
    })

    // Build community -> nodes map
    const communityNodes = new Map<number, string[]>()
    communities.forEach((community, nodeId) => {
      if (!communityNodes.has(community)) {
        communityNodes.set(community, [])
      }
      communityNodes.get(community)!.push(nodeId)
    })

    // Calculate modularity
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

  /**
   * Detect research gaps in the graph
   * Returns potential areas of research that are underrepresented
   */
  detectGaps(): {
    sparseAreas: Array<{ nodes: string[]; density: number; suggestion: string }>
    bridgeOpportunities: Array<{ community1: number; community2: number; potentialLinks: Array<{ source: string; target: string }> }>
    isolatedNodes: string[]
  } {
    const cacheKey = this.getCacheKey('gaps');
    const cached = this.getCached<ReturnType<typeof this.detectGaps>>(cacheKey);
    if (cached) return cached;

    const adjacency = this.buildAdjacencyList()
    const { communities, communityNodes } = this.detectCommunities()

    // 1. Find isolated nodes (degree <= 1)
    const isolatedNodes: string[] = []
    this.graph.nodes.forEach(node => {
      const neighbors = adjacency.get(node.id)
      if (!neighbors || neighbors.size <= 1) {
        isolatedNodes.push(node.id)
      }
    })

    // 2. Find sparse areas (communities with low internal density)
    const sparseAreas: Array<{ nodes: string[]; density: number; suggestion: string }> = []

    communityNodes.forEach((nodes, communityId) => {
      if (nodes.length < 2) return

      // Calculate internal edges
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

    // 3. Find bridge opportunities (communities that could be connected)
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

        // Check if communities have any edges between them
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

        // If very few connections, suggest bridges
        if (crossEdges < maxCrossEdges * 0.1 && nodes1.length >= 2 && nodes2.length >= 2) {
          // Find highest-degree nodes in each community as potential bridges
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

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    const nodeIds = new Set(this.graph.nodes.map(n => n.id))
    const edgeNodeIds = new Set<string>()

    this.graph.edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Ребро "${edge.id}" ссылается на несуществующий узел "${edge.source}"`)
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Ребро "${edge.id}" ссылается на несуществующий узел "${edge.target}"`)
      }
      edgeNodeIds.add(edge.source)
      edgeNodeIds.add(edge.target)
    })

    const orphanNodes = this.graph.nodes.filter(
      n => !edgeNodeIds.has(n.id)
    )
    orphanNodes.forEach(node => {
      errors.push(`Узел "${node.id}" (${node.label}) не имеет связей`)
    })

    const duplicateEdges = this.graph.edges.filter((edge, index) =>
      this.graph.edges.some((e, i) =>
        i !== index &&
        e.source === edge.source &&
        e.target === edge.target
      )
    )
    duplicateEdges.forEach(edge => {
      errors.push(`Дубликат ребра: ${edge.source} -> ${edge.target}`)
    })

    const selfLoops = this.graph.edges.filter(
      e => e.source === e.target
    )
    selfLoops.forEach(edge => {
      errors.push(`Самопетля в узле "${edge.source}"`)
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
