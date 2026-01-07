export interface Article {
  id: string
  title: string
  authors: string[]
  year: number
  abstract?: string
  keywords?: string[]
  citations?: string[]
  doi?: string
  url?: string
  published?: boolean
}

export interface GraphNode {
  id: string
  label: string
  weight?: number
  data?: Record<string, any>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  weight?: number
  directed?: boolean
  data?: Record<string, any>
}

export interface Graph {
  id: string
  name: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  directed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PathResult {
  path: string[]
  totalWeight: number
  length: number
}

export interface CentralityResult {
  nodeId: string
  degree: number
  betweenness: number
  closeness: number
  eigenvector: number
}

export interface ConnectivityResult {
  connected: boolean
  components: number
  largestComponent: number
}

export interface GraphStatistics {
  totalNodes: number
  totalEdges: number
  density: number
  averageDegree: number
  diameter: number
  averagePathLength: number
  clusteringCoefficient: number
}

export function createGraph(name: string, directed: boolean = false, nodes?: GraphNode[], edges?: GraphEdge[]): Graph {
  return {
    id: `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    nodes: nodes || [],
    edges: edges || [],
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

export function createEdge(id: string, source: string, target: string, weight?: number): GraphEdge {
  return {
    id,
    source,
    target,
    weight
  }
}