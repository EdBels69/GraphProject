/**
 * DEPRECATED: Use imports from '@/shared/contracts' instead
 * 
 * This file is kept for backward compatibility.
 * All types are re-exported from the canonical contracts.
 * 
 * @deprecated Import from '@/shared/contracts' or '@/shared/contracts/graph'
 */

// =============================================================================
// RE-EXPORTS FROM CONTRACTS (Canonical Source)
// =============================================================================

// Graph types - canonical versions
export type {
  GraphNode as GraphNodeNew,
  GraphEdge as GraphEdgeNew,
  Graph as GraphNew
} from './contracts/graph'

export type {
  CentralityResult as CentralityResultNew,
  PathResult as PathResultNew
} from './contracts/analysis'

export type { EntityType } from './contracts/entities'

// =============================================================================
// LEGACY TYPES (For Backward Compatibility)
// These will be removed in v3.0
// =============================================================================

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

/** @deprecated Use EntityType from contracts/entities */
export type NodeType =
  | 'Gene'
  | 'Protein'
  | 'Metabolite'
  | 'Disease'
  | 'Pathway'
  | 'Drug'
  | 'Symptom'
  | 'Anatomy'
  | 'Concept'

/** @deprecated Use RelationType from contracts/entities */
export type RelationType =
  | 'encodes'
  | 'interacts_with'
  | 'participates_in'
  | 'associated_with'
  | 'inhibits'
  | 'activates'
  | 'treats'
  | 'causes'
  | 'regulates'
  | 'transports'
  | 'metabolizes'
  | 'cooccurs_with'
  | 'related_to'

export type EvidenceType =
  | 'experimental'
  | 'database'
  | 'text_mining'
  | 'cooccurrence'
  | 'ai_extraction'

/** @deprecated Use GraphNode from contracts/graph */
export interface GraphNode {
  id: string
  label: string
  type?: NodeType
  weight?: number
  data?: Record<string, any>
}

/** @deprecated Use GraphEdge from contracts/graph */
export interface GraphEdge {
  id: string
  source: string
  target: string
  relation?: RelationType
  evidenceType?: EvidenceType
  confidence?: number
  weight?: number
  directed?: boolean
  data?: Record<string, any>
}

/** @deprecated Use Graph from contracts/graph */
export interface Graph {
  id: string
  name: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  directed: boolean
  createdAt: Date
  updatedAt: Date
}

/** @deprecated Use PathResult from contracts/analysis */
export interface PathResult {
  path: string[]
  totalWeight: number
  length: number
}

/** @deprecated Use CentralityResult from contracts/analysis */
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

// =============================================================================
// FACTORY FUNCTIONS (Kept for compatibility)
// =============================================================================

export function createGraph(
  name: string,
  directed: boolean = false,
  nodes?: GraphNode[],
  edges?: GraphEdge[]
): Graph {
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
  return { id, label, weight }
}

export function createEdge(id: string, source: string, target: string, weight?: number): GraphEdge {
  return { id, source, target, weight }
}