import axios from 'axios'

export interface SearchResult {
  id: string
  source: 'scholar' | 'pubmed' | 'crossref' | 'arxiv'
  title: string
  authors: string[]
  year?: number
  abstract?: string
  doi?: string
  url?: string
  citations?: number
  relevanceScore: number
}

export interface SearchOptions {
  query: string
  sources?: Array<'scholar' | 'pubmed' | 'crossref' | 'arxiv'>
  maxResults?: number
  yearFrom?: number
  yearTo?: number
  sortBy?: 'relevance' | 'date' | 'citations'
}

export interface SearchResults {
  query: string
  totalResults: number
  results: SearchResult[]
  bySource: Record<string, SearchResult[]>
  executionTime: number
}

export class GlobalSearch {
  private sources: Map<string, SearchFunction>

  constructor() {
    this.sources = new Map()
    this.initializeSources()
  }

  private initializeSources(): void {
    this.sources.set('scholar', this.searchGoogleScholar.bind(this))
    this.sources.set('pubmed', this.searchPubMed.bind(this))
    this.sources.set('crossref', this.searchCrossref.bind(this))
    this.sources.set('arxiv', this.searchArxiv.bind(this))
  }

  /**
   * Search multiple sources simultaneously
   */
  async search(options: SearchOptions): Promise<SearchResults> {
    const startTime = Date.now()
    const {
      query,
      sources = ['scholar', 'pubmed', 'crossref'],
      maxResults = 20,
      yearFrom,
      yearTo,
      sortBy = 'relevance'
    } = options

    // Search all requested sources in parallel
    const searchPromises = sources
      .filter(source => this.sources.has(source))
      .map(source => this.sources.get(source)!(query, { maxResults, yearFrom, yearTo, sortBy }))

    const results = await Promise.allSettled(searchPromises)

    // Collect successful results
    const allResults: SearchResult[] = []
    const bySource: Record<string, SearchResult[]> = {}

    for (let i = 0; i < results.length; i++) {
      const source = sources[i]
      const result = results[i]

      if (result.status === 'fulfilled') {
        const sourceResults = result.value
        allResults.push(...sourceResults)
        bySource[source] = sourceResults
      }
    }

    // Deduplicate results by DOI
    const deduplicated = this.deduplicateResults(allResults)

    // Sort by relevance score
    deduplicated.sort((a, b) => b.relevanceScore - a.relevanceScore)

    const executionTime = Date.now() - startTime

    return {
      query,
      totalResults: deduplicated.length,
      results: deduplicated.slice(0, maxResults),
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
   * Search Google Scholar (web scraping - respects robots.txt)
   */
  private async searchGoogleScholar(
    query: string,
    options: { maxResults: number; yearFrom?: number; yearTo?: number; sortBy?: string }
  ): Promise<SearchResult[]> {
    // Note: Google Scholar doesn't have an official API
    // This is a placeholder that returns mock data
    // In production, you would use a proxy service or alternative

    // For now, return mock results
    return [
      {
        id: `scholar-1`,
        source: 'scholar',
        title: `Mock result for "${query}" from Google Scholar`,
        authors: ['Author A', 'Author B'],
        year: 2023,
        abstract: 'This is a mock abstract. In production, this would be fetched from Google Scholar.',
        citations: 42,
        relevanceScore: 0.9,
        url: 'https://scholar.google.com/mock'
      }
    ]
  }

  /**
   * Search PubMed using E-utilities API
   */
  private async searchPubMed(
    query: string,
    options: { maxResults: number; yearFrom?: number; yearTo?: number; sortBy?: string }
  ): Promise<SearchResult[]> {
    try {
      const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
      const summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'

      // Search for article IDs
      const searchParams = new URLSearchParams({
        db: 'pubmed',
        term: query,
        retmax: options.maxResults.toString(),
        retmode: 'json'
      })

      if (options.yearFrom) {
        searchParams.append('mindate', `${options.yearFrom}/01/01`)
      }
      if (options.yearTo) {
        searchParams.append('maxdate', `${options.yearTo}/12/31`)
      }

      const searchResponse = await axios.get(`${baseUrl}?${searchParams.toString()}`)
      const searchResult = searchResponse.data.esearchresult
      const ids = searchResult.idlist || []

      if (ids.length === 0) {
        return []
      }

      // Fetch summaries
      const summaryParams = new URLSearchParams({
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'json'
      })

      const summaryResponse = await axios.get(`${summaryUrl}?${summaryParams.toString()}`)
      const summaryResult = summaryResponse.data.esummaryresult

      const results: SearchResult[] = []
      const articles = summaryResult.result

      for (const id of ids) {
        const article = articles[id]
        if (!article) continue

        results.push({
          id: `pubmed-${id}`,
          source: 'pubmed',
          title: article.title || '',
          authors: article.authors?.map((a: any) => a.name) || [],
          year: article.pubdate ? parseInt(article.pubdate.slice(0, 4)) : undefined,
          abstract: article.abstract || '',
          doi: article.elocationid || article.doi,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}`,
          citations: undefined, // PubMed doesn't provide citation count
          relevanceScore: 0.8
        })
      }

      return results
    } catch (error) {
      console.error('Error searching PubMed:', error)
      return []
    }
  }

  /**
   * Fetch MeSH terms for a given PubMed ID
   */
  async fetchMeshTerms(pmid: string): Promise<string[]> {
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

      return matches.map((m: string) => m.replace(/<.*?>/g, ''))
    } catch (error) {
      console.error('Error fetching MeSH terms:', error)
      return []
    }
  }

  /**
   * Search Crossref API - filtered for biomedical/life sciences
   */
  private async searchCrossref(
    query: string,
    options: { maxResults: number; yearFrom?: number; yearTo?: number; sortBy?: string }
  ): Promise<SearchResult[]> {
    try {
      const baseUrl = 'https://api.crossref.org/works'

      // Build filter string
      const filters: string[] = []
      if (options.yearFrom) {
        filters.push(`from-pub-date:${options.yearFrom}`)
      }
      if (options.yearTo) {
        filters.push(`until-pub-date:${options.yearTo}`)
      }
      filters.push('has-abstract:true')

      const params: Record<string, string> = {
        query,
        rows: (options.maxResults * 3).toString(), // Request more to filter later
        select: 'title,author,published-online,published-print,abstract,DOI,URL,is-referenced-by-count,subject,container-title',
        sort: 'relevance'
      }
      if (filters.length > 0) {
        params['filter'] = filters.join(',')
      }

      const response = await axios.get(baseUrl, {
        params,
        timeout: 15000,
        headers: { 'User-Agent': 'GraphAnalyser/1.0 (mailto:graphanalyser@example.com)' }
      })
      const items = response.data.message?.items || []

      // Biomedical keywords to filter relevant results
      const biomedKeywords = [
        'biology', 'biochem', 'medicine', 'medical', 'health', 'clinical', 'pharma',
        'drug', 'disease', 'cell', 'molecular', 'gene', 'protein', 'metabol', 'physiol',
        'pathol', 'neuro', 'cardio', 'immuno', 'oncol', 'nutrition', 'biomed', 'plos',
        'bmc', 'frontiers', 'nature', 'science', 'lancet', 'jama', 'elsevier',
        'carnitine', 'enzyme', 'mitochondr', 'lipid', 'amino', 'vitamin'
      ]

      // Keywords that indicate NON-biomedical content
      const excludeKeywords = ['law', 'legal', 'court', 'criminal', 'судебн', 'право',
        'уголовн', 'crm', 'sales', 'marketing', 'management', 'business', 'бизнес']

      const filteredItems = items.filter((item: any) => {
        const title = (item.title?.[0] || '').toLowerCase()
        const journal = (item['container-title']?.[0] || '').toLowerCase()
        const abstract = (item.abstract || '').toLowerCase()
        const allText = `${title} ${journal} ${abstract}`

        // Exclude if contains non-biomed keywords
        if (excludeKeywords.some(kw => allText.includes(kw))) return false

        // Include if contains biomed keywords
        return biomedKeywords.some(kw => allText.includes(kw))
      })

      return filteredItems.slice(0, options.maxResults).map((item: any) => {
        const pubDate = item['published-online'] || item['published-print']
        return {
          id: `crossref-${item.DOI}`,
          source: 'crossref' as const,
          title: item.title?.[0] || '',
          authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
          year: pubDate?.['date-parts']?.[0]?.[0],
          abstract: item.abstract?.replace(/<[^>]*>/g, '') || '',
          doi: item.DOI,
          url: item.URL,
          citations: item['is-referenced-by-count'] || 0,
          relevanceScore: 0.75
        }
      })
    } catch (error) {
      console.error('Error searching Crossref:', error)
      return []
    }
  }

  /**
   * Search arXiv
   */
  private async searchArxiv(
    query: string,
    options: { maxResults: number; yearFrom?: number; yearTo?: number; sortBy?: string }
  ): Promise<SearchResult[]> {
    try {
      const baseUrl = 'http://export.arxiv.org/api/query'
      const params: Record<string, string> = {
        search_query: query,
        start: '0',
        max_results: options.maxResults.toString()
      }

      const response = await axios.get(baseUrl, { params })
      const entries = response.data.entries || []

      return entries.map((entry: any) => ({
        id: `arxiv-${entry.id.split('/').pop()}`,
        source: 'arxiv',
        title: entry.title || '',
        authors: entry.authors?.map((a: any) => a.name) || [],
        year: entry.published ? parseInt(entry.published.slice(0, 4)) : undefined,
        abstract: entry.summary || '',
        url: entry.id,
        citations: undefined, // arXiv doesn't provide citation count
        relevanceScore: 0.7
      }))
    } catch (error) {
      console.error('Error searching arXiv:', error)
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
    result: SearchResult,
    query: string
  ): number {
    let score = 0.5 // Base score

    // Title match
    const titleLower = result.title.toLowerCase()
    const queryLower = query.toLowerCase()
    const queryWords = queryLower.split(/\s+/)

    for (const word of queryWords) {
      if (titleLower.includes(word)) {
        score += 0.2
      }
    }

    // Has abstract
    if (result.abstract) {
      score += 0.1
    }

    // Has DOI
    if (result.doi) {
      score += 0.1
    }

    // Has citations
    if (result.citations && result.citations > 0) {
      score += Math.min(0.2, result.citations / 100)
    }

    // Recency (more recent = higher score)
    if (result.year) {
      const age = new Date().getFullYear() - result.year
      score += Math.max(0, 0.2 - age * 0.02)
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
  options: { maxResults: number; yearFrom?: number; yearTo?: number; sortBy?: string }
) => Promise<SearchResult[]>

export default new GlobalSearch()
