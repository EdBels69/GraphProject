import { Graph, GraphNode, GraphEdge, CentralityResult } from '../../shared/types'

export interface CentralityOptions {
  directed?: boolean
  normalized?: boolean
  maxIterations?: number
  tolerance?: number
}

export interface CentralityResults {
  degree: CentralityResult[]
  betweenness: CentralityResult[]
  closeness: CentralityResult[]
  eigenvector: CentralityResult[]
  pagerank: CentralityResult[]
}

export class GraphCentrality {
  /**
   * Calculate all centrality measures for a graph
   */
  calculateAll(graph: Graph, options: CentralityOptions = {}): CentralityResults {
    return {
      degree: this.calculateDegreeCentrality(graph, options),
      betweenness: this.calculateBetweennessCentrality(graph, options),
      closeness: this.calculateClosenessCentrality(graph, options),
      eigenvector: this.calculateEigenvectorCentrality(graph, options),
      pagerank: this.calculatePageRank(graph, options)
    }
  }

  /**
   * Degree Centrality: Number of connections per node
   */
  calculateDegreeCentrality(graph: Graph, options: CentralityOptions = {}): CentralityResult[] {
    const { directed = graph.directed, normalized = true } = options
    const results: CentralityResult[] = []

    // Build adjacency list
    const adjacency = this.buildAdjacencyList(graph, directed)

    for (const node of graph.nodes) {
      const nodeId = node.id
      const neighbors = adjacency.get(nodeId) || new Set()

      // Calculate degree
      let degree = neighbors.size

      // For undirected graphs, degree is just neighbor count
      // For directed graphs, we can calculate in-degree and out-degree separately
      if (directed) {
        const inDegree = this.calculateInDegree(graph, nodeId)
        const outDegree = neighbors.size
        degree = inDegree + outDegree
      }

      // Normalize by (n-1) for comparison
      const normalizedDegree = normalized && graph.nodes.length > 1
        ? degree / (graph.nodes.length - 1)
        : degree

      results.push({
        nodeId,
        degree: normalizedDegree,
        betweenness: 0,
        closeness: 0,
        eigenvector: 0
      })
    }

    return results
  }

  /**
   * Betweenness Centrality: Nodes on shortest paths
   */
  calculateBetweennessCentrality(graph: Graph, options: CentralityOptions = {}): CentralityResult[] {
    const { directed = graph.directed, normalized = true } = options
    const results: CentralityResult[] = []
    const betweenness = new Map<string, number>()

    // Initialize all nodes with 0
    for (const node of graph.nodes) {
      betweenness.set(node.id, 0)
    }

    // For each pair of nodes, calculate shortest paths and count contributions
    const nodes = graph.nodes.map(n => n.id)
    const adjacency = this.buildAdjacencyList(graph, directed)

    for (const source of nodes) {
      const predecessors = new Map<string, string[]>()
      const sigma = new Map<string, number>()
      const distance = new Map<string, number>()
      const queue: string[] = []

      // Initialize
      for (const node of nodes) {
        predecessors.set(node, [])
        sigma.set(node, 0)
        distance.set(node, -1)
      }

      sigma.set(source, 1)
      distance.set(source, 0)
      queue.push(source)

      // BFS to find shortest paths
      while (queue.length > 0) {
        const v = queue.shift()!
        const neighbors = adjacency.get(v) || new Set()

        for (const w of neighbors) {
          if (distance.get(w) === -1) {
            distance.set(w, distance.get(v)! + 1)
            queue.push(w)
          }

          if (distance.get(w) === distance.get(v)! + 1) {
            sigma.set(w, sigma.get(w)! + sigma.get(v)!)
            predecessors.get(w)!.push(v)
          }
        }
      }

      // Calculate betweenness
      const delta = new Map<string, number>()
      for (const node of nodes) {
        delta.set(node, 0)
      }

      // Process nodes in reverse order of distance
      const sortedNodes = [...nodes].sort((a, b) => {
        const distA = distance.get(a) || -1
        const distB = distance.get(b) || -1
        return distB - distA
      })

      for (const w of sortedNodes) {
        if (w === source) continue

        for (const v of predecessors.get(w) || []) {
          const coeff = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!)
          delta.set(v, delta.get(v)! + coeff)
        }

        if (w !== source) {
          betweenness.set(w, betweenness.get(w)! + delta.get(w)!)
        }
      }
    }

    // Normalize results
    const n = graph.nodes.length
    const normalizationFactor = normalized && n > 2
      ? (directed ? 2 : 1) / ((n - 1) * (n - 2))
      : 1

    for (const node of graph.nodes) {
      const value = betweenness.get(node.id) || 0
      results.push({
        nodeId: node.id,
        degree: 0,
        betweenness: value * normalizationFactor,
        closeness: 0,
        eigenvector: 0
      })
    }

    return results
  }

  /**
   * Closeness Centrality: Average distance to all other nodes
   */
  calculateClosenessCentrality(graph: Graph, options: CentralityOptions = {}): CentralityResult[] {
    const { directed = graph.directed, normalized = true } = options
    const results: CentralityResult[] = []
    const adjacency = this.buildAdjacencyList(graph, directed)

    for (const sourceNode of graph.nodes) {
      const distances = this.calculateShortestDistances(graph, sourceNode.id, adjacency)
      let totalDistance = 0
      let reachableNodes = 0

      for (const [nodeId, distance] of distances) {
        if (distance > 0 && distance !== Infinity) {
          totalDistance += distance
          reachableNodes++
        }
      }

      const closeness = reachableNodes > 0
        ? reachableNodes / totalDistance
        : 0

      // Normalize by (n-1)
      const normalizedCloseness = normalized && graph.nodes.length > 1
        ? closeness * (reachableNodes / (graph.nodes.length - 1))
        : closeness

      results.push({
        nodeId: sourceNode.id,
        degree: 0,
        betweenness: 0,
        closeness: normalizedCloseness,
        eigenvector: 0
      })
    }

    return results
  }

  /**
   * Eigenvector Centrality: Influence based on neighbor connections
   * Uses power iteration method
   */
  calculateEigenvectorCentrality(graph: Graph, options: CentralityOptions = {}): CentralityResult[] {
    const { directed = graph.directed, maxIterations = 100, tolerance = 1e-6 } = options
    const results: CentralityResult[] = []
    const adjacency = this.buildAdjacencyList(graph, directed)

    // Initialize eigenvector with 1s
    const eigenvector = new Map<string, number>()
    for (const node of graph.nodes) {
      eigenvector.set(node.id, 1)
    }

    // Power iteration
    for (let iter = 0; iter < maxIterations; iter++) {
      const newEigenvector = new Map<string, number>()
      let maxChange = 0

      for (const node of graph.nodes) {
        let sum = 0
        const neighbors = adjacency.get(node.id) || new Set()

        for (const neighborId of neighbors) {
          sum += eigenvector.get(neighborId) || 0
        }

        newEigenvector.set(node.id, sum)
      }

      // Normalize
      const norm = Math.sqrt([...newEigenvector.values()].reduce((a, b) => a + b * b, 0))
      for (const [nodeId, value] of newEigenvector) {
        const normalized = norm > 0 ? value / norm : 0
        newEigenvector.set(nodeId, normalized)

        const change = Math.abs(normalized - (eigenvector.get(nodeId) || 0))
        maxChange = Math.max(maxChange, change)
      }

      eigenvector.clear()
      for (const [nodeId, value] of newEigenvector) {
        eigenvector.set(nodeId, value)
      }

      if (maxChange < tolerance) {
        break
      }
    }

    for (const node of graph.nodes) {
      results.push({
        nodeId: node.id,
        degree: 0,
        betweenness: 0,
        closeness: 0,
        eigenvector: eigenvector.get(node.id) || 0
      })
    }

    return results
  }

  /**
   * PageRank: Importance based on link structure
   */
  calculatePageRank(graph: Graph, options: CentralityOptions = {}): CentralityResult[] {
    const { directed = graph.directed, maxIterations = 100, tolerance = 1e-6 } = options
    const results: CentralityResult[] = []
    const adjacency = this.buildAdjacencyList(graph, directed)

    const dampingFactor = 0.85
    const n = graph.nodes.length

    // Initialize PageRank values
    const pagerank = new Map<string, number>()
    for (const node of graph.nodes) {
      pagerank.set(node.id, 1 / n)
    }

    // Power iteration
    for (let iter = 0; iter < maxIterations; iter++) {
      const newPagerank = new Map<string, number>()
      let maxChange = 0

      for (const node of graph.nodes) {
        let sum = 0
        const neighbors = adjacency.get(node.id) || new Set()

        for (const neighborId of neighbors) {
          const neighborDegree = adjacency.get(neighborId)?.size || 1
          sum += (pagerank.get(neighborId) || 0) / neighborDegree
        }

        const value = (1 - dampingFactor) / n + dampingFactor * sum
        newPagerank.set(node.id, value)

        const change = Math.abs(value - (pagerank.get(node.id) || 0))
        maxChange = Math.max(maxChange, change)
      }

      pagerank.clear()
      for (const [nodeId, value] of newPagerank) {
        pagerank.set(nodeId, value)
      }

      if (maxChange < tolerance) {
        break
      }
    }

    for (const node of graph.nodes) {
      results.push({
        nodeId: node.id,
        degree: 0,
        betweenness: 0,
        closeness: 0,
        eigenvector: pagerank.get(node.id) || 0
      })
    }

    return results
  }

  /**
   * Get top N nodes by centrality measure
   */
  getTopByCentrality(
    results: CentralityResult[],
    measure: keyof CentralityResult,
    n: number = 10
  ): CentralityResult[] {
    return [...results]
      .sort((a, b) => (b[measure] as number) - (a[measure] as number))
      .slice(0, n)
  }

  /**
   * Build adjacency list from graph
   */
  private buildAdjacencyList(graph: Graph, directed: boolean): Map<string, Set<string>> {
    const adjacency = new Map<string, Set<string>>()

    // Initialize all nodes
    for (const node of graph.nodes) {
      adjacency.set(node.id, new Set())
    }

    // Add edges
    for (const edge of graph.edges) {
      if (directed || !edge.directed) {
        adjacency.get(edge.source)?.add(edge.target)
      }
      if (!directed) {
        adjacency.get(edge.target)?.add(edge.source)
      }
    }

    return adjacency
  }

  /**
   * Calculate in-degree for directed graphs
   */
  private calculateInDegree(graph: Graph, nodeId: string): number {
    let count = 0
    for (const edge of graph.edges) {
      if (edge.target === nodeId) {
        count++
      }
    }
    return count
  }

  /**
   * Calculate shortest distances from source node using BFS
   */
  private calculateShortestDistances(
    graph: Graph,
    sourceId: string,
    adjacency: Map<string, Set<string>>
  ): Map<string, number> {
    const distances = new Map<string, number>()
    const visited = new Set<string>()
    const queue: string[] = [sourceId]

    for (const node of graph.nodes) {
      distances.set(node.id, Infinity)
    }
    distances.set(sourceId, 0)
    visited.add(sourceId)

    while (queue.length > 0) {
      const current = queue.shift()!
      const neighbors = adjacency.get(current) || new Set()

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          distances.set(neighbor, distances.get(current)! + 1)
          queue.push(neighbor)
        }
      }
    }

    return distances
  }
}

export default new GraphCentrality()
