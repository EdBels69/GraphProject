/**
 * Contracts Index - Re-export all contracts
 * 
 * Import from here:
 * import { Entity, Graph, AnalysisResult } from '@/shared/contracts'
 */

// Entity types and interfaces
export {
    EntityType,
    Entity,
    Relation,
    RelationType,
    ExtractionResult,
    ENTITY_TYPE_META,
    isValidEntityType,
    isEntity,
} from './entities'

// Graph structures
export {
    GraphNode,
    GraphEdge,
    Graph,
    GraphMetrics,
    GraphFilter,
    GraphLayout,
    isGraphNode,
    isGraph,
} from './graph'

// Analysis results
export {
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
export {
    SchemaVersion,
    CURRENT_SCHEMA_VERSION,
    StoredGraph,
    StoredExtraction,
    Migration,
    MIGRATIONS,
    migrateToLatest,
    StorageAdapter,
    ExportFormat,
    ExportOptions,
    ExportResult,
} from './storage'
