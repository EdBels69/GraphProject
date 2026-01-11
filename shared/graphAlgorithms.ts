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
import { cacheManager } from '../api/core/CacheManager'
import { GraphValidator } from './algorithms/GraphValidator'
import { PathFinder } from './algorithms/PathFinder'
import { CentralityCalculator } from './algorithms/CentralityCalculator'
import { CommunityDetector } from './algorithms/CommunityDetector'
import { GraphStatistics as GraphStatisticsCalculator } from './algorithms/GraphStatistics'

export class GraphAnalyzer {
  private graph: Graph
  private cachePrefix: string
  private validator: GraphValidator
  private pathFinder: PathFinder
  private centralityCalculator: CentralityCalculator
  private communityDetector: CommunityDetector
  private statisticsCalculator: GraphStatisticsCalculator

  constructor(graph: Graph) {
    this.graph = graph
    this.cachePrefix = `graph:${graph.id}:`

    // Initialize strategies
    this.validator = new GraphValidator(graph)
    this.pathFinder = new PathFinder(graph, this.cachePrefix)
    this.centralityCalculator = new CentralityCalculator(graph, this.cachePrefix)
    this.communityDetector = new CommunityDetector(graph, this.cachePrefix)
    this.statisticsCalculator = new GraphStatisticsCalculator(graph, this.cachePrefix)
  }

  private getCacheKey(operation: string, params?: string): string {
    const paramStr = params ? `:${params}` : '';
    return `${this.cachePrefix}${operation}${paramStr}`;
  }

  private setCached<T>(key: string, value: T, ttl?: number): void {
    cacheManager.set<T>(key, value, ttl);
  }

  // Delegated methods

  findShortestPath(startId: string, endId: string): PathResult | null {
    return this.pathFinder.findShortestPath(startId, endId)
  }

  findAllShortestPaths(): Map<string, Map<string, PathResult>> {
    return this.pathFinder.findAllShortestPaths()
  }

  calculateCentrality(): CentralityResult[] {
    return this.centralityCalculator.calculateCentrality()
  }

  calculatePageRank(dampingFactor: number = 0.85, iterations: number = 100): Map<string, number> {
    return this.centralityCalculator.calculatePageRank(dampingFactor, iterations)
  }

  checkConnectivity(): ConnectivityResult {
    return this.statisticsCalculator.checkConnectivity()
  }

  calculateStatistics(): GraphStatistics {
    return this.statisticsCalculator.calculateStatistics()
  }

  detectCommunities() {
    return this.communityDetector.detectCommunities()
  }

  detectGaps() {
    return this.communityDetector.detectGaps()
  }

  validate() {
    return this.validator.validate()
  }

  // Mutation methods (kept here as they modify the graph state directly)

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
}
