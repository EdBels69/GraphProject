import { UniversalGraph } from '../../shared/contracts/graph'
import { Article } from '../../shared/contracts/article'

export interface ExportResult {
    data: string | Buffer
    filename: string
    mimeType?: string
}

export interface GraphExporter {
    id: string
    name: string
    extension: string
    mimeType: string

    export(graph: UniversalGraph, options?: { articles?: Article[] }): Promise<ExportResult>
}
