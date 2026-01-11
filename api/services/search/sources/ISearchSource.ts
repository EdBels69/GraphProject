
import { SearchResult } from '../../globalSearch'

export interface SearchSourceOptions {
    maxResults?: number
    sortBy?: 'relevance' | 'date' | 'citations'
    fromDate?: string
    toDate?: string
}

export interface ISearchSource {
    /**
     * Source identifier (e.g., 'pubmed', 'crossref')
     */
    name: string

    /**
     * Search for articles
     */
    search(query: string, options?: SearchSourceOptions): Promise<SearchResult[]>
}
