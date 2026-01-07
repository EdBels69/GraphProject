import { Graph, PathResult } from '../../shared/types'

export interface PathOptions {
  source?: string
  target?: string
  maxPaths?: number
  maxLength?: number
  weighted?: boolean
}

export interface PathAnalysisResults {
  shortestPath?: PathResult
  allShortestPaths?: PathResult[]
  kShortestPaths?: PathResult[]
  pathLengthDistribution: {
    min: number
    max: number
    average: number
    median: number
    distribution: Record<number, number>
  }
  cycles: string[][]
  connectedComponents: string[][]
}

export class PathAnalysis {
  /**
   * Get shortest path between two nodes
   */
  getShortestPath(graph: Graph, sourceId: string, targetId: string): PathResult | null {
    const adjacency = this.buildAdjacencyList(graph)
    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const visited = new Set<string>()

    // Initialize distances
    for (const node of graph.nodes) {
      distances.set(node.id, Infinity)
    }
    distances.set(sourceId, 0)

    // BFS for unweighted shortest path
    const queue: string[] = [sourceId]
    visited.add(sourceId)

    while (queue.length > 0) {
      const current = queue.shift()!
      const neighbors = adjacency.get(current) || new Set()

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          distances.set(neighbor, distances.get(current)! + 1)
          previous.set(neighbor, current)
          queue.push(neighbor)

          if (neighbor === targetId) {
            // Reconstruct path
            return this.reconstructPath(previous, sourceId, targetId, distances)
          }
        }
      }
    }

    return null // No path found
  }

  /**
   * Get all shortest paths between two nodes
   */
  getAllShortestPaths(graph: Graph, sourceId: string, targetId: string): PathResult[] {
    const adjacency = this.buildAdjacencyList(graph)
    const allPaths: string[][] = []
    const shortestLength = this.getShortestPath(graph, sourceId, targetId)?.length || 0

    if (shortestLength === 0) {
      return []
    }

    // DFS to find all paths of shortest length
    this.findAllPathsDFS(
      adjacency,
      sourceId,
      targetId,
      [],
      new Set([sourceId]),
      allPaths,
      shortestLength
    )

    return allPaths.map(path => ({
      path,
      totalWeight: path.length - 1,
      length: path.length
    }))
  }

  /**
   * Get K shortest paths between two nodes
   */
  getKShortestPaths(
    graph: Graph,
    sourceId: string,
    targetId: string,
    k: number = 5
  ): PathResult[] {
    const adjacency = this.buildAdjacencyList(graph)
    const paths: PathResult[] = []
    const visited = new Map<string, number>()

    // Use Yen's algorithm for K shortest paths
    const shortestPath = this.getShortestPath(graph, sourceId, targetId)
    if (!shortestPath) {
      return []
    }

    paths.push(shortestPath)

    for (let i = 1; i < k; i++) {
      const spurPaths: PathResult[] = []

      for (let j = 0; j < paths[i - 1].path.length - 1; j++) {
        const spurNode = paths[i - 1].path[j]
        const rootPath = paths[i - 1].path.slice(0, j + 1)

        // Remove edges used in previous paths
        const removedEdges: Array<{ source: string; target: string }> = []
        for (const path of paths) {
          const pathSlice = path.path.slice(0, j + 1)
          if (JSON.stringify(pathSlice) === JSON.stringify(rootPath)) {
            const edgeSource = path.path[j]
            const edgeTarget = path.path[j + 1]
            removedEdges.push({ source: edgeSource, target: edgeTarget })
          }
        }

        // Remove nodes in root path (except spur node)
        const removedNodes = new Set(rootPath.slice(0, j))

        // Find spur path
        const spurPath = this.getShortestPathModified(
          graph,
          spurNode,
          targetId,
          removedEdges,
          removedNodes
        )

        if (spurPath) {
          const fullPath = [...rootPath, ...spurPath.path.slice(1)]
          spurPaths.push({
            path: fullPath,
            totalWeight: fullPath.length - 1,
            length: fullPath.length
          })
        }
      }

      if (spurPaths.length === 0) {
        break
      }

      // Sort and add shortest
      spurPaths.sort((a, b) => a.length - b.length)
      paths.push(spurPaths[0])
    }

    return paths.slice(0, k)
  }

  /**
   * Get path length distribution
   */
  getPathLengthDistribution(graph: Graph): PathAnalysisResults['pathLengthDistribution'] {
    const adjacency = this.buildAdjacencyList(graph)
    const pathLengths: number[] = []
    const distribution: Record<number, number> = {}

    // Calculate all-pairs shortest paths
    for (const source of graph.nodes) {
      const distances = this.calculateDistances(graph, source.id, adjacency)
      for (const [nodeId, distance] of distances) {
        if (distance > 0 && distance !== Infinity) {
          pathLengths.push(distance)
          distribution[distance] = (distribution[distance] || 0) + 1
        }
      }
    }

    if (pathLengths.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0, distribution: {} }
    }

    pathLengths.sort((a, b) => a - b)

    const min = pathLengths[0]
    const max = pathLengths[pathLengths.length - 1]
    const average = pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length
    const median = pathLengths.length % 2 === 0
      ? (pathLengths[pathLengths.length / 2 - 1] + pathLengths[pathLengths.length / 2]) / 2
      : pathLengths[Math.floor(pathLengths.length / 2)]

    return { min, max, average, median, distribution }
  }

  /**
   * Find cycles in the graph
   */
  findCycles(graph: Graph): string[][] {
    const cycles: string[][] = []
    const adjacency = this.buildAdjacencyList(graph)
    const visited = new Set<string>()
    const recStack = new Set<string>()

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        this.findCyclesDFS(node.id, adjacency, visited, recStack, [], cycles)
      }
    }

    return cycles
  }

  /**
   * Find connected components
   */
  findConnectedComponents(graph: Graph): string[][] {
    const adjacency = this.buildAdjacencyList(graph)
    const visited = new Set<string>()
    const components: string[][] = []

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        const component: string[] = []
        this.findComponentDFS(node.id, adjacency, visited, component)
        components.push(component)
      }
    }

    return components
  }

  /**
   * Get diameter of the graph (longest shortest path)
   */
  getDiameter(graph: Graph): number {
    const adjacency = this.buildAdjacencyList(graph)
    let maxDistance = 0

    for (const source of graph.nodes) {
      const distances = this.calculateDistances(graph, source.id, adjacency)
      for (const distance of distances.values()) {
        if (distance !== Infinity && distance > maxDistance) {
          maxDistance = distance
        }
      }
    }

    return maxDistance
  }

  /**
   * Get average path length
   */
  getAveragePathLength(graph: Graph): number {
    const distribution = this.getPathLengthDistribution(graph)
    return distribution.average
  }

  /**
   * Build adjacency list from graph
   */
  private buildAdjacencyList(graph: Graph): Map<string, Set<string>> {
    const adjacency = new Map<string, Set<string>>()

    for (const node of graph.nodes) {
      adjacency.set(node.id, new Set())
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.source)?.add(edge.target)
      if (!graph.directed) {
        adjacency.get(edge.target)?.add(edge.source)
      }
    }

    return adjacency
  }

  /**
   * Reconstruct path from previous nodes
   */
  private reconstructPath(
    previous: Map<string, string>,
    sourceId: string,
    targetId: string,
    distances: Map<string, number>
  ): PathResult {
    const path: string[] = []
    let current = targetId

    while (current !== sourceId) {
      path.unshift(current)
      current = previous.get(current) || sourceId
    }
    path.unshift(sourceId)

    return {
      path,
      totalWeight: distances.get(targetId) || 0,
      length: path.length
    }
  }

  /**
   * Find all paths using DFS
   */
  private findAllPathsDFS(
    adjacency: Map<string, Set<string>>,
    current: string,
    target: string,
    currentPath: string[],
    visited: Set<string>,
    allPaths: string[][],
    maxLength: number
  ): void {
    currentPath.push(current)

    if (current === target) {
      if (currentPath.length - 1 === maxLength) {
        allPaths.push([...currentPath])
      }
      currentPath.pop()
      return
    }

    if (currentPath.length - 1 >= maxLength) {
      currentPath.pop()
      return
    }

    const neighbors = adjacency.get(current) || new Set()
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        this.findAllPathsDFS(adjacency, neighbor, target, currentPath, visited, allPaths, maxLength)
        visited.delete(neighbor)
      }
    }

    currentPath.pop()
  }

  /**
   * Get shortest path with removed edges/nodes
   */
  private getShortestPathModified(
    graph: Graph,
    sourceId: string,
    targetId: string,
    removedEdges: Array<{ source: string; target: string }>,
    removedNodes: Set<string>
  ): PathResult | null {
    const adjacency = this.buildAdjacencyList(graph)
    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const visited = new Set<string>()

    // Remove specified edges
    for (const edge of removedEdges) {
      adjacency.get(edge.source)?.delete(edge.target)
      if (!graph.directed) {
        adjacency.get(edge.target)?.delete(edge.source)
      }
    }

    // Initialize distances
    for (const node of graph.nodes) {
      distances.set(node.id, Infinity)
    }
    distances.set(sourceId, 0)

    // BFS
    const queue: string[] = [sourceId]
    visited.add(sourceId)

    while (queue.length > 0) {
      const current = queue.shift()!
      const neighbors = adjacency.get(current) || new Set()

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor) && !removedNodes.has(neighbor)) {
          visited.add(neighbor)
          distances.set(neighbor, distances.get(current)! + 1)
          previous.set(neighbor, current)
          queue.push(neighbor)

          if (neighbor === targetId) {
            return this.reconstructPath(previous, sourceId, targetId, distances)
          }
        }
      }
    }

    return null
  }

  /**
   * Calculate distances from source node
   */
  private calculateDistances(
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

  /**
   * DFS to find cycles
   */
  private findCyclesDFS(
    nodeId: string,
    adjacency: Map<string, Set<string>>,
    visited: Set<string>,
    recStack: Set<string>,
    currentPath: string[],
    cycles: string[][]
  ): void {
    visited.add(nodeId)
    recStack.add(nodeId)
    currentPath.push(nodeId)

    const neighbors = adjacency.get(nodeId) || new Set()
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.findCyclesDFS(neighbor, adjacency, visited, recStack, currentPath, cycles)
      } else if (recStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = currentPath.indexOf(neighbor)
        const cycle = [...currentPath.slice(cycleStart), neighbor]
        cycles.push(cycle)
      }
    }

    recStack.delete(nodeId)
    currentPath.pop()
  }

  /**
   * DFS to find connected component
   */
  private findComponentDFS(
    nodeId: string,
    adjacency: Map<string, Set<string>>,
    visited: Set<string>,
    component: string[]
  ): void {
    visited.add(nodeId)
    component.push(nodeId)

    const neighbors = adjacency.get(nodeId) || new Set()
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this.findComponentDFS(neighbor, adjacency, visited, component)
      }
    }
  }
}

export default new PathAnalysis()
