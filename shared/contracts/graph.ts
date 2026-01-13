// Universal Graph Contract
export interface UniversalGraph {
    id: string
    version: '3.0'

    metadata: GraphMetadata
    nodes: GraphNode[]
    edges: GraphEdge[]

    // Computed properties
    metrics: GraphMetrics
    directed: boolean
    updatedAt?: string
}

export type Graph = UniversalGraph

export interface GraphMetadata {
    name: string
    description?: string
    method: string  // ID of GraphMethod used
    source: 'literature' | 'manual' | 'imported'
    domain: string  // 'biochemistry', 'clinical', etc.
    createdAt: string
    createdBy: string

    // Provenance
    sourceData: {
        articleCount: number
        dateRange?: { from: string; to: string }
    }
}

export interface GraphNode {
    id: string
    label: string
    type: string  // 'keyword', 'protein', 'author', 'pathway', etc.

    // Universal properties
    properties: {
        frequency?: number
        source?: string[]
        [key: string]: any
    }

    // Visual properties (optional, for UI)
    visual?: {
        x?: number
        y?: number
        color?: string
        size?: number
    }
}

export interface GraphEdge {
    id: string
    source: string
    target: string
    type: string  // 'co-occurs', 'interacts', 'cites', etc.

    properties: {
        weight: number
        confidence?: number
        evidence: string[]  // Article IDs
        [key: string]: any
    }
}

export interface GraphMetrics {
    nodeCount: number
    edgeCount: number
    density: number
    avgDegree: number
    clusteringCoefficient?: number
    components: number
}

export function createGraph(name: string, directed: boolean = false): UniversalGraph {
    return {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        version: '3.0',
        directed,
        metadata: {
            name,
            method: 'merged',
            source: 'manual',
            domain: 'general',
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            sourceData: { articleCount: 0 }
        },
        nodes: [],
        edges: [],
        metrics: {
            nodeCount: 0,
            edgeCount: 0,
            density: 0,
            avgDegree: 0,
            components: 0
        }
    }
}

export function createNode(id: string, label: string, type: string = 'keyword'): GraphNode {
    return {
        id,
        label,
        type,
        properties: { frequency: 1 },
        visual: { size: 5, color: '#3b82f6' }
    }
}

export function createEdge(source: string, target: string, type: string = 'related', weight: number = 1): GraphEdge {
    return {
        id: `${source}-${target}`,
        source,
        target,
        type,
        properties: { weight, evidence: [] }
    }
}
