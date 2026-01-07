import { Graph, GraphNode, GraphEdge, PathResult, CentralityResult, ConnectivityResult, GraphStatistics } from './types'
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
          const newDistance = (distances.get(currentNode) || 0) + weight
          if (newDistance < (distances.get(neighborId) || Infinity)) {
            distances.set(neighborId, newDistance)
            previous.set(neighborId, currentNode)
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
        degree,
        betweenness,
        closeness,
        eigenvector
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
    this.graph.updatedAt = new Date()
  }

  addEdge(edge: GraphEdge): void {
    this.graph.edges.push(edge)
    this.graph.updatedAt = new Date()
  }

  removeNode(nodeId: string): void {
    this.graph.nodes = this.graph.nodes.filter(n => n.id !== nodeId)
    this.graph.edges = this.graph.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )
    this.graph.updatedAt = new Date()
  }

  removeEdge(edgeId: string): void {
    this.graph.edges = this.graph.edges.filter(e => e.id !== edgeId)
    this.graph.updatedAt = new Date()
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

export function createGraph(name: string, directed: boolean = false): Graph {
  return {
    id: `graph-${Date.now()}`,
    name,
    nodes: [],
    edges: [],
    directed,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export function createNode(id: string, label: string, weight?: number): GraphNode {
  return {
    id,
    label,
    weight
  }
}

export function createEdge(id: string, source: string, target: string, weight?: number, directed?: boolean): GraphEdge {
  return {
    id,
    source,
    target,
    weight,
    directed
  }
}