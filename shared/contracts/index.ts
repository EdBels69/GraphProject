/**
 * Contracts Index - Re-export all contracts
 * 
 * Import from here:
 * import { Entity, Graph, AnalysisResult } from '@/shared/contracts'
 */

// Entity types and interfaces
export type {
    EntityType,
    Entity,
    Relation,
    RelationType,
    ExtractionResult,
} from './entities'

export {
    ENTITY_TYPE_META,
    isValidEntityType,
    isEntity,
} from './entities'

// Graph structures
export type {
    GraphNode,
    GraphEdge,
    Graph,
    GraphMetrics,
} from './graph'

export {
    createGraph,
    createNode,
    createEdge,
} from './graph'

// Analysis results
export type {
    CentralityResult,
    CentralityAnalysis,
    Community,
    ClusteringAnalysis,
    PathResult,
    PathAnalysis,
    ResearchGap,
    GapAnalysis,
    AnalysisType,
    AnalysisRequest,
    AnalysisResponse,
} from './analysis'

// Storage and migration
export type {
    SchemaVersion,
    StoredGraph,
    StoredExtraction,
    Migration,
    StorageAdapter,
    ExportFormat,
    ExportOptions,
    ExportResult,
} from './storage'

export {
    CURRENT_SCHEMA_VERSION,
    MIGRATIONS,
    migrateToLatest,
} from './storage'

// Research jobs
export type {
    ResearchJobStatus,
    ResearchJob,
    ResearchJobRequest,
    ResearchJobResponse,
    ResearchSource,
    ArticleSource,
} from './research'

export {
    isResearchJob,
    isValidResearchSource,
} from './research'
