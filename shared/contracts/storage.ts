/**
 * Storage Contracts - Data persistence and migration
 * @version 2.0
 */

import { Graph } from './graph'
import { ExtractionResult } from './entities'

// =============================================================================
// SCHEMA VERSIONS
// =============================================================================

export type SchemaVersion = '1.0' | '1.1' | '2.0'

export const CURRENT_SCHEMA_VERSION: SchemaVersion = '2.0'

// =============================================================================
// STORED DATA TYPES
// =============================================================================

export interface StoredGraph {
    version: SchemaVersion
    data: Graph

    /** Storage metadata */
    storedAt: string
    updatedAt: string
    size: number  // bytes

    /** Checksum for integrity */
    checksum?: string
}

export interface StoredExtraction {
    version: SchemaVersion
    data: ExtractionResult

    storedAt: string
    sourceHash: string  // Hash of source document
}

// =============================================================================
// MIGRATION
// =============================================================================

export interface Migration {
    from: SchemaVersion
    to: SchemaVersion
    migrate: (data: unknown) => unknown
}

/**
 * Registry of migrations
 * Add new migrations here when schema changes
 */
export const MIGRATIONS: Migration[] = [
    {
        from: '1.0',
        to: '1.1',
        migrate: (data: any) => {
            // Example: Add new fields with defaults
            return {
                ...data,
                version: '1.1',
                metadata: data.metadata || {}
            }
        }
    },
    {
        from: '1.1',
        to: '2.0',
        migrate: (data: any) => {
            // Example: Rename field, add new entity types
            return {
                ...data,
                version: '2.0',
                // No breaking changes, just version bump
            }
        }
    }
]

/**
 * Apply migrations to bring data to current version
 */
export function migrateToLatest<T>(data: { version: SchemaVersion } & T): T {
    let current = data

    for (const migration of MIGRATIONS) {
        if (current.version === migration.from) {
            current = migration.migrate(current) as typeof current
        }
    }

    return current
}

// =============================================================================
// STORAGE INTERFACE
// =============================================================================

export interface StorageAdapter {
    /** Save graph */
    saveGraph(graph: Graph): Promise<string>

    /** Load graph by ID */
    loadGraph(id: string): Promise<Graph | null>

    /** List all graphs */
    listGraphs(): Promise<Array<{ id: string; name: string; updatedAt: string }>>

    /** Delete graph */
    deleteGraph(id: string): Promise<boolean>

    /** Search graphs */
    searchGraphs(query: string): Promise<Graph[]>
}

// =============================================================================
// EXPORT FORMATS
// =============================================================================

export type ExportFormat =
    | 'json'
    | 'csv'
    | 'graphml'
    | 'gexf'
    | 'cytoscape'
    | 'word'
    | 'pdf'

export interface ExportOptions {
    format: ExportFormat
    includeMetrics?: boolean
    includeMetadata?: boolean
    filterNodeTypes?: string[]
}

export interface ExportResult {
    format: ExportFormat
    content: string | Blob
    filename: string
    mimeType: string
}
