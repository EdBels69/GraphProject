/**
 * Analysis Contracts - Analysis results and operations
 * @version 2.0
 */

import { EntityType } from './entities'

// =============================================================================
// CENTRALITY ANALYSIS
// =============================================================================

export interface CentralityResult {
    nodeId: string
    nodeName: string
    nodeType: EntityType

    /** Centrality measures */
    degree: number
    betweenness: number
    closeness: number
    eigenvector: number
    pagerank: number

    /** Rank among all nodes */
    rank: number
}

export interface CentralityAnalysis {
    version: '1.0' | '2.0'
    graphId: string
    timestamp: string

    results: CentralityResult[]

    /** Top nodes by each metric */
    topByDegree: CentralityResult[]
    topByBetweenness: CentralityResult[]
    topByPagerank: CentralityResult[]
}

// =============================================================================
// CLUSTERING / COMMUNITY DETECTION
// =============================================================================

export interface Community {
    id: number
    name?: string
    nodes: string[]
    size: number

    /** Dominant entity types in community */
    dominantTypes: Array<{ type: EntityType; count: number }>

    /** Internal density */
    density: number

    /** Hub nodes */
    hubs: string[]
}

export interface ClusteringAnalysis {
    version: '1.0' | '2.0'
    graphId: string
    timestamp: string
    algorithm: 'louvain' | 'leiden' | 'label_propagation' | 'hierarchical'

    communities: Community[]
    modularity: number

    /** Silhouette score for clustering quality */
    quality?: number
}

// =============================================================================
// PATH ANALYSIS
// =============================================================================

export interface PathResult {
    source: string
    target: string
    path: string[]  // Node IDs
    length: number
    totalWeight: number
}

export interface PathAnalysis {
    version: '1.0' | '2.0'
    graphId: string
    timestamp: string

    shortestPaths: PathResult[]

    /** Graph diameter */
    diameter: number

    /** Average path length */
    averagePathLength: number
}

// =============================================================================
// RESEARCH GAP DETECTION
// =============================================================================

export interface ResearchGap {
    id: string
    type: 'missing_link' | 'sparse_area' | 'isolated_cluster' | 'bridge_opportunity'

    /** Involved entities */
    entities: Array<{
        id: string
        name: string
        type: EntityType
    }>

    /** Gap description */
    description: string

    /** Confidence in gap detection */
    confidence: number

    /** Priority score for research */
    priority: number

    /** Suggested research directions */
    suggestions: string[]
}

export interface GapAnalysis {
    version: '1.0' | '2.0'
    graphId: string
    timestamp: string

    gaps: ResearchGap[]

    /** Overall graph coverage score */
    coverageScore: number

    /** Areas with most potential */
    hotspots: Array<{
        area: string
        score: number
        relatedGaps: string[]
    }>
}

// =============================================================================
// ANALYSIS REQUEST/RESPONSE
// =============================================================================

export type AnalysisType =
    | 'centrality'
    | 'clustering'
    | 'paths'
    | 'gaps'
    | 'full'

export interface AnalysisRequest {
    graphId: string
    types: AnalysisType[]
    options?: {
        centralityTop?: number
        clusteringAlgorithm?: ClusteringAnalysis['algorithm']
        pathSourceTarget?: { source: string; target: string }[]
    }
}

export interface AnalysisResponse {
    graphId: string
    timestamp: string
    processingTimeMs: number

    centrality?: CentralityAnalysis
    clustering?: ClusteringAnalysis
    paths?: PathAnalysis
    gaps?: GapAnalysis
}
