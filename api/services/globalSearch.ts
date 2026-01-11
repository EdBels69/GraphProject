import { logger } from '../core/Logger'
import cacheManager from './cacheManager'
import { journalMetricService } from './journalMetricService'
import { ISearchSource, SearchSourceOptions } from './search/sources/ISearchSource'
import { PubMedSource } from './search/sources/PubMedSource'
import { CrossrefSource } from './search/sources/CrossrefSource'
export interface SearchResult {
  id: string
  source: 'scholar' | 'pubmed' | 'crossref' | 'arxiv' | 'biorxiv'
  title: string
  authors: string[]
  year?: number
  abstract?: string
  doi?: string
  url?: string
  citations?: number
  relevanceScore: number
  quartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  impactFactor?: number
  issn?: string
  journal?: string
}

export interface SearchOptions {
  query: string
  sources?: Array<'scholar' | 'pubmed' | 'crossref' | 'arxiv' | 'biorxiv'>
  maxResults?: number
  sortBy?: 'relevance' | 'date' | 'citations'
  fromDate?: string
  toDate?: string
  onProgress?: (source: string, count: number) => void
}

export interface SearchResults {
  query: string
  totalResults: number
  results: SearchResult[]
  bySource: Record<string, SearchResult[]>
  executionTime: number
}

export class GlobalSearch {
  private sources: Map<string, ISearchSource>

  constructor() {
    this.sources = new Map()
    this.initializeSources()
  }

  private initializeSources(): void {
    // Register sources
    const pubmed = new PubMedSource()
    this.sources.set(pubmed.name, pubmed)

    const crossref = new CrossrefSource()
    this.sources.set(crossref.name, crossref)

    // TODO: Migrate ArXiv and Google Scholar to ISearchSource
    // For now, we keep them disabled or we handle them in a legacy way if needed
    // But based on previous analysis, only PubMed and Crossref are actively used/reliable in this context.
  }

  /**
   * Search multiple sources simultaneously
   */
  async search(options: SearchOptions): Promise<SearchResults> {
    const startTime = Date.now()
    const {
      query,
      sources = (options.sources && options.sources.length > 0) ? options.sources : ['scholar', 'pubmed', 'crossref'],
      maxResults = 20,
      fromDate,
      toDate,
      sortBy = 'relevance',
      onProgress
    } = options

    // Search all requested sources in parallel
    const searchPromises = sources
      .filter(source => this.sources.has(source))
      .map(sourceName => {
        const source = this.sources.get(sourceName)!
        return source.search(query, { maxResults, fromDate, toDate, sortBy })
          .then(results => {
            if (onProgress) {
              onProgress(sourceName, results.length)
            }
            return results
          })
      })

    const results = await Promise.allSettled(searchPromises)

    // Collect successful results
    const allResults: SearchResult[] = []
    const bySource: Record<string, SearchResult[]> = {}

    for (let i = 0; i < results.length; i++) {
      const source = sources[i]
      const result = results[i]

      if (result.status === 'fulfilled') {
        const sourceResults = result.value
        logger.info('GlobalSearch', `Source ${source} returned ${sourceResults.length} results`)
        allResults.push(...sourceResults)
        bySource[source] = sourceResults
      } else {
        logger.error('GlobalSearch', `Source ${source} failed`, { error: result.reason })
      }
    }

    // Deduplicate results by DOI
    const deduplicated = this.deduplicateResults(allResults)

    // Sort by relevance score
    deduplicated.sort((a, b) => b.relevanceScore - a.relevanceScore)

    // Enrich with metrics (IF/Quartiles)
    const enrichedResults = await journalMetricService.enrichArticles(deduplicated)

    const executionTime = Date.now() - startTime

    return {
      query,
      totalResults: enrichedResults.length,
      results: enrichedResults, // No more slice here, return all
      bySource,
      executionTime
    }
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(options: SearchOptions & {
    fields?: string[]
    hasAbstract?: boolean
    hasDoi?: boolean
    minCitations?: number
  }): Promise<SearchResults> {
    const results = await this.search(options)

    // Apply filters
    let filtered = results.results

    if (options.hasAbstract) {
      filtered = filtered.filter(r => !!r.abstract)
    }

    if (options.hasDoi) {
      filtered = filtered.filter(r => !!r.doi)
    }

    if (options.minCitations) {
      filtered = filtered.filter(r => (r.citations || 0) >= options.minCitations!)
    }

    return {
      ...results,
      totalResults: filtered.length,
      results: filtered
    }
  }







  /**
   * Fetch MeSH terms for a given PubMed ID
   */
  async fetchMeshTerms(pmid: string): Promise<string[]> {
    const cacheKey = `pubmed:mesh:${pmid}`
    const cached = cacheManager.get<string[]>(cacheKey)
    if (cached) return cached

    try {
      const fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
      const response = await axios.get(fetchUrl, {
        params: {
          db: 'pubmed',
          id: pmid,
          retmode: 'xml'
        }
      })

      // Basic parsing of XML to extracting MeshHeading DescriptorName
      // Matches <DescriptorName UI="D012345">Term</DescriptorName>
      const matches = response.data.match(/<DescriptorName UI="D\d+.*?">(.*?)<\/DescriptorName>/g)
      if (!matches) return []

      const result = matches.map((m: string) => m.replace(/<.*?>/g, ''))

      // Cache for 24 hours (MeSH terms don't change often)
      cacheManager.set(cacheKey, result, { ttl: 24 * 60 * 60 * 1000 })

      return result
    } catch (error) {
      console.error('Error fetching MeSH terms:', error)
      return []
    }
  }





  /**
   * Deduplicate results by DOI
   */
  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>()
    const deduplicated: SearchResult[] = []

    for (const result of results) {
      const key = result.doi || `${result.source}-${result.title}`
      if (!seen.has(key)) {
        seen.add(key)
        deduplicated.push(result)
      }
    }

    return deduplicated
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevanceScore(
    result: any,
    query: string
  ): number {
    let score = 0.3 // Base score

    const titleLower = (result.title || '').toLowerCase()
    const abstractLower = (result.abstract || '').toLowerCase()
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)

    // Exact phrase match in title (Highest weight)
    if (titleLower.includes(queryLower)) {
      score += 0.5
    }

    // Individual word matches in title
    let titleWordMatches = 0
    for (const word of queryWords) {
      if (titleLower.includes(word)) {
        titleWordMatches++
        score += 0.15
      }
    }

    // Exact phrase match in abstract
    if (abstractLower.includes(queryLower)) {
      score += 0.25
    }

    // Word matches in abstract
    let abstractWordMatches = 0
    for (const word of queryWords) {
      if (abstractLower.includes(word)) {
        abstractWordMatches++
        score += 0.05
      }
    }

    // Source weight
    if (result.source === 'pubmed') score += 0.1
    if (result.source === 'scholar') score += 0.05

    // Journal/Source quality cues
    const qualityJournals = ['nature', 'science', 'lancet', 'jama', 'cell', 'nejm', 'bmj', 'plos', 'bmc']
    const sourceLower = (result.journal || result.source || '').toLowerCase()
    if (qualityJournals.some(j => sourceLower.includes(j) || titleLower.includes(j))) {
      score += 0.1
    }

    // Has DOI (indicates published work)
    if (result.doi) score += 0.05

    // Has citations (Social proof)
    if (result.citations && result.citations > 0) {
      score += Math.min(0.15, (result.citations / 50) * 0.1)
    }

    // Recency (last 5 years preferred)
    if (result.year) {
      const age = new Date().getFullYear() - result.year
      score += Math.max(0, 0.15 - age * 0.015)
    }

    return Math.min(1, score)
  }

  /**
   * Get article details by DOI
   */
  async getArticleByDOI(doi: string): Promise<SearchResult | null> {
    try {
      const response = await axios.get(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
      const item = response.data.message

      return {
        id: `crossref-${item.DOI}`,
        source: 'crossref',
        title: item.title?.[0] || '',
        authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || [],
        year: item['published-online']?.['date-parts']?.[0],
        abstract: item.abstract || '',
        doi: item.DOI,
        url: item.URL,
        citations: item['is-referenced-by-count'] || 0,
        relevanceScore: 1
      }
    } catch (error) {
      console.error('Error fetching article by DOI:', error)
      return null
    }
  }
}

type SearchFunction = (
  query: string,
  options: { maxResults: number; fromDate?: string; toDate?: string; sortBy?: string }
) => Promise<SearchResult[]>

export default new GlobalSearch()
