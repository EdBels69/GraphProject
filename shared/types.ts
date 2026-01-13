/**
 * Unified Type Definitions
 * 
 * This file constructs the public API for shared types by re-exporting
 * from the domain-specific contracts.
 * 
 * Legacy types have been removed to enforce usage of the new contracts.
 */

// Domain Contracts
export * from './contracts/graph'
export * from './contracts/entities'
export * from './contracts/analysis'
export * from './contracts/research'

// Compatibility aliases (optional, removal preferred)
import { Graph, GraphNode, GraphEdge } from './contracts/graph'

/** @deprecated Use Graph from contracts/graph */
export type LegacyGraph = Graph

/** @deprecated Use GraphNode from contracts/graph */
export type LegacyGraphNode = GraphNode

// Legacy Article (Temporary retention if needed, but preferable to use ArticleSource)
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