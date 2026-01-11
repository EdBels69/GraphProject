import { ResearchSource, ArticleSource } from '../../shared/contracts/research'
import { Graph } from '../../shared/contracts/graph'

export interface ISearchResult {
    results: any[]
    totalResults: number
    [key: string]: any
}

export interface IGlobalSearch {
    search(params: {
        query: string,
        sources: ResearchSource[],
        maxResults?: number,
        fromDate?: string,
        toDate?: string,
        sortBy?: string
    }): Promise<ISearchResult>
}

export interface IUnpaywallService {
    batchFindPdfs(dois: string[]): Promise<Map<string, { pdfUrl?: string }>>
}

export interface IDocumentParser {
    parsePDF(buffer: Buffer, title?: string): Promise<{ content: string; metadata: any }>
}

export interface IChunkingEngine {
    chunkText(text: string, sourceId: string): Promise<any[]>
}

export interface IEntityExtractor {
    extractFromChunks(chunks: any[]): Promise<{
        entities: any[],
        relations: any[],
        statistics: {
            totalEntities: number,
            byType: Record<string, number>,
            totalRelations: number,
            meshNormalized: number
        }
    }>
    mergeEntities(entities: any[]): any[]
}

export interface IRelationExtractor {
    extractRelations(text: string, entities: any[], sourceId: string): Promise<{ relations: any[] }>
}

export interface IGraphBuilderResult {
    graph: Graph
    metadata: {
        entities: number
        relations: number
        sources: string[]
        createdAt: Date
    }
}

export interface IKnowledgeGraphBuilder {
    buildGraph(entities: any[], relations: any[], options?: {
        minConfidence?: number
        minMentions?: number
        includeCooccurrence?: boolean
        maxNodes?: number
    }): Promise<IGraphBuilderResult>
}
