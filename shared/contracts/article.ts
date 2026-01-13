// Article Contract
export interface Article {
    id: string
    title: string
    authors: string[]
    year: number
    abstract: string
    keywords: string[]
    doi?: string
    pdfUrl?: string
    source: string

    // Metadata
    metadata: ArticleMetadata
}

export interface ArticleMetadata {
    pdfStatus: 'downloaded' | 'available' | 'paywall' | 'not-found'
    pdfLocalPath?: string
    screeningStatus?: 'pending' | 'included' | 'excluded'
    tags: string[]

    // Extracted features (populated by processors)
    features?: ExtractedFeatures
}

export interface ExtractedFeatures {
    proteins?: string[]
    pathways?: string[]
    diseases?: string[]
    chemicals?: string[]
    outcomes?: string[]

    // Custom columns (user-defined or domain-specific)
    custom?: Record<string, any>
}
