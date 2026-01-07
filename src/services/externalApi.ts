import { withRetry } from '@/utils/retryHandler'

interface ArticleMetadata {
  title: string
  authors: string[]
  year: number
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  pmid?: string
  abstract?: string
  keywords?: string[]
  url?: string
}

interface PubMedResponse {
  uid?: string
  title?: string
  authors?: { name: string }[]
  pubdate?: string
  journal?: { name: string; volume: string; issue: string; pages: string }
  doi?: string
  pmid?: string
  abstract?: string
  keywords?: string[]
}

interface CrossRefResponse {
  title?: string[]
  author?: { given: string; family: string }[]
  published?: { 'date-parts': number[][] }[]
  'container-title'?: string[]
  volume?: string
  issue?: string
  page?: string
  DOI?: string
  URL?: string
  abstract?: string
}

class ExternalApiService {
  private readonly PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
  private readonly CROSSREF_BASE = 'https://api.crossref.org'
  private readonly SEMANTIC_SCHOLAR_BASE = 'https://api.semanticscholar.org/graph/v1'

  async fetchArticleByUrl(url: string): Promise<ArticleMetadata | null> {
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        },
        { maxRetries: 3, initialDelay: 2000 },
        `fetch-url-${url}`
      )

      return this.parseArticleFromHtml(response)
    } catch (error) {
      console.error('Error fetching article by URL:', error)
      return null
    }
  }

  async fetchArticleByDOI(doi: string): Promise<ArticleMetadata | null> {
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(`${this.CROSSREF_BASE}/works/${encodeURIComponent(doi)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        },
        { maxRetries: 3, initialDelay: 2000 },
        `fetch-doi-${doi}`
      )

      return this.parseCrossRefResponse(response)
    } catch (error) {
      console.error('Error fetching article by DOI:', error)
      return null
    }
  }

  async fetchArticleByPMID(pmid: string): Promise<ArticleMetadata | null> {
    try {
      const summaryResponse = await withRetry(
        async () => {
          const res = await fetch(`${this.PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`, {
            method: 'GET',
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        },
        { maxRetries: 3, initialDelay: 2000 },
        `fetch-pmid-${pmid}`
      )

      const abstractResponse = await withRetry(
        async () => {
          const res = await fetch(`${this.PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=json`, {
            method: 'GET',
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        },
        { maxRetries: 3, initialDelay: 2000 },
        `fetch-pmid-abstract-${pmid}`
      )

      return this.parsePubMedResponse(summaryResponse, abstractResponse)
    } catch (error) {
      console.error('Error fetching article by PMID:', error)
      return null
    }
  }

  async fetchArticleBySemanticScholar(paperId: string): Promise<ArticleMetadata | null> {
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(`${this.SEMANTIC_SCHOLAR_BASE}/paper/${encodeURIComponent(paperId)}?fields=title,authors,year,venue,externalIds,abstract,url,openAccessPdf`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        },
        { maxRetries: 3, initialDelay: 2000 },
        `fetch-s2-${paperId}`
      )

      return this.parseSemanticScholarResponse(response)
    } catch (error) {
      console.error('Error fetching article by Semantic Scholar:', error)
      return null
    }
  }

  async searchArticles(query: string, limit: number = 10): Promise<ArticleMetadata[]> {
    try {
      const response = await withRetry(
        async () => {
          const res = await fetch(`${this.SEMANTIC_SCHOLAR_BASE}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,venue,externalIds,abstract,url`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        },
        { maxRetries: 3, initialDelay: 2000 },
        `search-${query}`
      )

      return response.data?.map((item: any) => this.parseSemanticScholarResponse(item)).filter(Boolean) || []
    } catch (error) {
      console.error('Error searching articles:', error)
      return []
    }
  }

  private parseCrossRefResponse(data: CrossRefResponse): ArticleMetadata {
    return {
      title: data.title?.[0] || '',
      authors: data.author?.map(a => `${a.given} ${a.family}`) || [],
      year: data.published?.[0]?.['date-parts']?.[0]?.[0] || 0,
      journal: data['container-title']?.[0],
      volume: data.volume,
      issue: data.issue,
      pages: data.page,
      doi: data.DOI,
      url: data.URL,
      abstract: data.abstract
    }
  }

  private parsePubMedResponse(summary: any, abstractData: any): ArticleMetadata {
    const uid = Object.keys(summary.result || {})[0]
    const article = summary.result?.[uid]

    return {
      title: article?.title || '',
      authors: article?.authors?.map((a: any) => a.name) || [],
      year: parseInt(article?.pubdate?.split(' ')[0] || '0'),
      journal: article?.journal?.name,
      volume: article?.journal?.volume,
      issue: article?.journal?.issue,
      pages: article?.journal?.pages,
      pmid: uid,
      doi: article?.doi,
      abstract: abstractData?.[uid]?.abstract || ''
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
      abstract: data.abstract
    }
  }

  private parseArticleFromHtml(html: any): ArticleMetadata | null {
    return null
  }
}

export const externalApiService = new ExternalApiService()
