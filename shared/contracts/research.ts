/**
 * Research Contracts - Literature Agent Job Management
 * @version 1.0
 */

// =============================================================================
// RESEARCH JOB STATUS
// =============================================================================

export type ResearchJobStatus =
    | 'pending'
    | 'searching'
    | 'downloading'
    | 'analyzing'
    | 'completed'
    | 'failed'
    | 'cancelled'

// =============================================================================
// RESEARCH JOB
// =============================================================================

export type ResearchMode = 'quick' | 'research'

export interface ResearchJob {
    /** Unique job identifier */
    id: string

    /** Research topic/query */
    topic: string

    /** Job mode: quick (auto-analyze) or research (screening table) */
    mode: ResearchMode

    /** Current job status */
    status: ResearchJobStatus

    /** Progress 0-100 */
    progress: number

    /** Generated search queries */
    queries: string[]

    /** Total articles found */
    articlesFound: number

    /** Articles successfully processed */
    articlesProcessed: number

    /** List of found articles */
    articles?: ArticleSource[]

    // === SCREENING (Research Mode) ===
    /** IDs of papers marked for inclusion */
    includedIds?: string[]

    /** IDs of papers marked for exclusion */
    excludedIds?: string[]

    /** Exclusion reasons by paper ID */
    exclusionReasons?: Record<string, string>

    // === RESULTS ===
    /** Result graph ID (available when completed) */
    graphId?: string

    /** Literature review text (available when completed) */
    reviewText?: string

    /** Extracted entities (stored for graph building) */
    extractedEntities?: any[]

    /** Extracted relations (stored for graph building) */
    extractedRelations?: any[]

    /** Error message if failed */
    error?: string

    /** Job timestamps */
    createdAt: string
    updatedAt: string
    completedAt?: string
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

export interface ResearchJobRequest {
    /** Research topic */
    topic: string

    /** Mode: 'quick' (auto-analyze) or 'research' (screening table) */
    mode?: ResearchMode

    /** Maximum articles to process (default: 20) */
    maxArticles?: number

    /** Sources to search */
    sources?: ResearchSource[]

    /** Year range filter */
    yearFrom?: number
    yearTo?: number

    /** Generate literature review with AI */
    generateReview?: boolean
}

export type ResearchSource = 'pubmed' | 'crossref' | 'arxiv'

export interface ResearchJobResponse {
    job: ResearchJob
    message: string
}

// =============================================================================
// ARTICLE SOURCE
// =============================================================================

export interface ArticleSource {
    /** Internal ID */
    id: string

    /** DOI if available */
    doi?: string

    /** Article title */
    title: string

    /** Authors list */
    authors?: string[]

    /** Publication year */
    year?: number

    /** Abstract text */
    abstract?: string

    /** Keywords */
    keywords?: string[]

    /** URL to PDF (Open Access) */
    pdfUrl?: string

    /** Public URL (PubMed/Publisher) */
    url?: string

    /** Original source */
    source: ResearchSource | 'unpaywall'

    /** Processing status */
    status: 'pending' | 'downloaded' | 'processed' | 'failed'

    /** Screening decision (Research mode) */
    screeningStatus?: 'pending' | 'included' | 'excluded'

    /** Extracted tabular data (Research mode) */
    extractedData?: Record<string, any>

    /** Error if failed */
    error?: string
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isResearchJob(obj: unknown): obj is ResearchJob {
    if (typeof obj !== 'object' || obj === null) return false
    const job = obj as Record<string, unknown>
    return (
        typeof job.id === 'string' &&
        typeof job.topic === 'string' &&
        typeof job.status === 'string' &&
        typeof job.progress === 'number'
    )
}

export function isValidResearchSource(source: string): source is ResearchSource {
    return ['pubmed', 'crossref', 'arxiv'].includes(source)
}
