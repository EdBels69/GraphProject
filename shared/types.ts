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

// Entity types for heterogeneous biomedical knowledge graph
export type NodeType =
  | 'Gene'
  | 'Protein'
  | 'Metabolite'
  | 'Disease'
  | 'Pathway'
  | 'Drug'
  | 'Symptom'
  | 'Anatomy'
  | 'Concept'  // Fallback for unclassified entities

// Relation types following Biolink model
export type RelationType =
  | 'encodes'           // Gene -> Protein
  | 'interacts_with'    // Protein <-> Protein
  | 'participates_in'   // Entity -> Pathway
  | 'associated_with'   // Gene/Protein <-> Disease
  | 'inhibits'          // Drug -> Protein/Gene
  | 'activates'         // Drug -> Protein/Gene
  | 'treats'            // Drug -> Disease
  | 'causes'            // Entity -> Disease/Symptom
  | 'regulates'         // Gene -> Gene
  | 'transports'        // Protein -> Metabolite
  | 'metabolizes'       // Enzyme -> Metabolite
  | 'cooccurs_with'     // Fallback: co-occurrence in text
  | 'related_to'        // Fallback: unspecified relation

// Evidence types (STRING-style)
export type EvidenceType =
  | 'experimental'      // Lab-validated
  | 'database'          // Curated database (KEGG, Reactome)
  | 'text_mining'       // NLP from literature
  | 'cooccurrence'      // Same paragraph/sentence
  | 'ai_extraction'     // LLM-extracted

export interface GraphNode {
  id: string
  label: string
  type?: NodeType           // NEW: Entity type
  weight?: number
  data?: Record<string, any>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  relation?: RelationType   // NEW: Typed relation
  evidenceType?: EvidenceType  // NEW: How was this edge discovered
  confidence?: number       // NEW: 0-1 confidence score
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