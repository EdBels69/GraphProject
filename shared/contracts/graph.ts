/**
 * Graph Contracts - Graph data structures
 * @version 2.0
 */

import { Entity, Relation, EntityType } from './entities'

// =============================================================================
// GRAPH NODE
// =============================================================================

export interface GraphNode {
    id: string
    label: string
    type: EntityType

    /** Visual properties */
    size?: number
    color?: string
    x?: number
    y?: number

    /** Entity data */
    data: Entity

    /** Computed metrics (filled by analysis) */
    metrics?: {
        degree?: number
        betweenness?: number
        closeness?: number
        pagerank?: number
        clustering?: number
        community?: number
    }
}

// =============================================================================
// GRAPH EDGE
// =============================================================================

export interface GraphEdge {
    id: string
    source: string
    target: string

    /** Edge weight/strength */
    weight: number

    /** Relation data */
    data: Relation

    /** Visual properties */
    color?: string
    width?: number
    style?: 'solid' | 'dashed' | 'dotted'
}

// =============================================================================
// GRAPH STRUCTURE
// =============================================================================

export interface Graph {
    /** Schema version for migration */
    version: '1.0' | '1.1' | '2.0'

    /** Graph metadata */
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt: string

    /** Graph data */
    nodes: GraphNode[]
    edges: GraphEdge[]

    /** Graph-level metrics */
    metrics?: GraphMetrics

    /** Source information */
    sources: Array<{
        id: string
        type: 'pubmed' | 'word' | 'manual'
        title?: string
    }>

    /** Extensible metadata */
    metadata?: Record<string, unknown>
}

// =============================================================================
// GRAPH METRICS
// =============================================================================

export interface GraphMetrics {
    /** Basic stats */
    nodeCount: number
    edgeCount: number
    density: number

    /** Connectivity */
    isConnected: boolean
    componentCount: number
    largestComponentSize: number

    /** Centrality stats */
    averageDegree: number
    maxDegree: number
    averageClustering: number

    /** Path stats */
    diameter?: number
    averagePathLength?: number

    /** Community detection */
    communityCount?: number
    modularity?: number
}

// =============================================================================
// GRAPH OPERATIONS
// =============================================================================

export interface GraphFilter {
    /** Filter by entity types */
    entityTypes?: EntityType[]

    /** Filter by min confidence */
    minConfidence?: number

    /** Filter by min mentions */
    minMentions?: number

    /** Filter by relation types */
    relationTypes?: string[]

    /** Filter by node IDs */
    nodeIds?: string[]

    /** Subgraph around specific node */
    focusNode?: {
        id: string
        depth: number
    }
}

export interface GraphLayout {
    type: 'force' | 'circular' | 'hierarchical' | 'grid' | 'concentric'
    options?: Record<string, unknown>
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isGraphNode(obj: unknown): obj is GraphNode {
    if (typeof obj !== 'object' || obj === null) return false
    const n = obj as Record<string, unknown>
    return (
        typeof n.id === 'string' &&
        typeof n.label === 'string' &&
        typeof n.type === 'string'
    )
}

export function isGraph(obj: unknown): obj is Graph {
    if (typeof obj !== 'object' || obj === null) return false
    const g = obj as Record<string, unknown>
    return (
        typeof g.id === 'string' &&
        typeof g.name === 'string' &&
        Array.isArray(g.nodes) &&
        Array.isArray(g.edges)
    )
}
