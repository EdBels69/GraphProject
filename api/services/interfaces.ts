import { ResearchSource, ArticleSource } from '../../shared/contracts/research'
import { Graph } from '../../shared/contracts/graph'

export interface ISearchResult {
    results: any[]
    total: number
}

export interface IGlobalSearch {
    search(params: {
        query: string,
        sources: ResearchSource[],
        maxResults?: number,
        yearFrom?: number,
        yearTo?: number
    }): Promise<ISearchResult>
}

export interface IUnpaywallService {
    batchFindPdfs(dois: string[]): Promise<Map<string, { pdfUrl: string | null }>>
}

export interface IDocumentParser {
    parsePDF(buffer: Buffer, title?: string): Promise<{ content: string; metadata: any }>
}

export interface IChunkingEngine {
    chunkText(text: string, sourceId: string): Promise<any[]>
}

export interface IEntityExtractor {
    extractFromChunks(chunks: any[]): Promise<{ entities: any[] }>
    mergeEntities(entities: any[]): any[]
}

export interface IRelationExtractor {
    extractRelations(text: string, entities: any[], sourceId: string): Promise<{ relations: any[] }>
}

export interface IGraphBuilderResult {
    graph: Graph
}

export interface IKnowledgeGraphBuilder {
    buildGraph(entities: any[], relations: any[]): Promise<IGraphBuilderResult>
}
