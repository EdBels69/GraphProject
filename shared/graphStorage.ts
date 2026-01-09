import { Graph, GraphNode, GraphEdge } from './contracts/graph'

const GRAPHS_STORAGE_KEY = 'graph-analyser-graphs'

export class GraphStorage {
  private static graphs: Map<string, Graph> = new Map()
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  }

  static initialize(): void {
    if (!this.isBrowser()) {
      return
    }
    try {
      const stored = localStorage.getItem(GRAPHS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.graphs = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.error('Failed to load graphs from storage:', error)
    }
  }

  static getAll(): Graph[] {
    return Array.from(this.graphs.values())
  }

  static getById(id: string): Graph | null {
    return this.graphs.get(id) || null
  }

  static save(graph: Graph): Graph {
    graph.updatedAt = new Date().toISOString()
    this.graphs.set(graph.id, graph)
    this.persist()
    return graph
  }

  static delete(id: string): boolean {
    const deleted = this.graphs.delete(id)
    if (deleted) {
      this.persist()
    }
    return deleted
  }

  static createNode(graphId: string, node: Omit<GraphNode, 'id'>): GraphNode {
    const newNode: GraphNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...node
    }
    return newNode
  }

  static createEdge(graphId: string, edge: Omit<GraphEdge, 'id'>): GraphEdge {
    const newEdge: GraphEdge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...edge
    }
    return newEdge
  }

  private static persist(): void {
    if (!this.isBrowser()) {
      return
    }
    try {
      const data = Object.fromEntries(this.graphs)
      localStorage.setItem(GRAPHS_STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to persist graphs:', error)
    }
  }

  static clear(): void {
    this.graphs.clear()
    if (this.isBrowser()) {
      localStorage.removeItem(GRAPHS_STORAGE_KEY)
    }
  }
}

export default GraphStorage