import { withRetry } from '../utils/retry'

export interface ArticleMetadata {
    title: string
    authors: string[]
    year: number
    journal?: string
    doi?: string
    pmid?: string
    abstract?: string
    url?: string
}

export class ExternalApiService {
    private readonly SEMANTIC_SCHOLAR_BASE = 'https://api.semanticscholar.org/graph/v1'

    async searchArticles(query: string, limit: number = 5): Promise<ArticleMetadata[]> {
        try {
            const response = await withRetry(
                async () => {
                    // Note: Semantic Scholar API might require API key for higher rates, but public endpoint works for low volume
                    // fields: title,authors,year,venue,externalIds,abstract,url
                    const url = `${this.SEMANTIC_SCHOLAR_BASE}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,venue,externalIds,abstract,url,openAccessPdf`
                    const res = await fetch(url, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    })
                    if (!res.ok) throw new Error(`HTTP ${res.status}`)
                    return res.json()
                },
                { maxRetries: 3, retryDelay: 2000 },
                `search-${query}`
            )

            return (response.data || []).map((item: any) => this.parseSemanticScholarResponse(item)).filter(Boolean)
        } catch (error) {
            console.error('ExternalApi', 'Search failed', { error })
            return []
        }
    }

    private parseSemanticScholarResponse(data: any): ArticleMetadata | null {
        if (!data) return null
        return {
            title: data.title || '',
            authors: data.authors?.map((a: any) => a.name) || [],
            year: data.year || 0,
            journal: data.venue,
            doi: data.externalIds?.DOI,
            pmid: data.externalIds?.PubMed,
            url: data.url || data.openAccessPdf?.url,
            abstract: data.abstract || ''
        }
    }
}

export const externalApiService = new ExternalApiService()
