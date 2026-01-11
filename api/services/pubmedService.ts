import axios from 'axios';
import { logger } from '../core/Logger';
import cacheManager from './cacheManager';

export interface PubMedArticle {
  uid: string;
  title: string;
  abstractText?: string;
  authors?: Array<{
    name: string;
    lastName?: string;
    foreName?: string;
  }>;
  journalInfo?: {
    title: string;
    pubDate: string;
  };
  publicationTypes?: string[];
  keywords?: Array<{
    name: string;
  }>;
  meshTerms?: string[];
  pmid?: string;
  doi?: string;
  pmc?: string;
  issn?: string;
}

export interface PubMedSearchResult {
  esearchresult: {
    count: string | number;
    retmax: string | number;
    retstart: string | number;
    querykey?: string;
    webenv?: string;
    idlist: string[];
    errors?: any;
    warning?: string;
  }
}

export interface PubMedArticleDetails {
  uids: string[];
  result: {
    uids: string[];
    [key: string]: PubMedArticle | string[];
  };
}

export class PubMedService {
  private baseURL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  private apiKey: string;
  private maxRetries = 3;
  private lastRequestTime = 0;
  private requestDelay: number;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PUBMED_API_KEY || '';
    // Limit is 3 req/s without key (334ms), 10 req/s with key (100ms).
    // We use a safe margin of 800ms/200ms to avoid burst throttling.
    this.requestDelay = this.apiKey ? 200 : 800;
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;
    if (timeSinceLast < this.requestDelay) {
      await this.sleep(this.requestDelay - timeSinceLast);
    }
    this.lastRequestTime = Date.now();
  }

  private async fetchWithRetry<T>(
    url: string,
    retries = this.maxRetries
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.throttle();
        const response = await axios.get(url, {
          timeout: 30000,
          headers: { 'User-Agent': 'GraphAnalyser/1.0' },
          // Ensure we get the raw text first to avoid axios's automatic JSON parsing masking the error details
          // But actually, axios throws if JSON is invalid. 
          // The error "Unexpected end of JSON input" usually comes from axios internals when response is truncated.
          // Let's keep default transformResponse but catch the error specifically.
        });

        // Validation: Ensure data exists
        if (!response.data) {
          throw new Error('Empty response data received');
        }

        // If T implies an object/array, we can do a basic type check
        if (typeof response.data !== 'object') {
          // Some PubMed endpoints might return text/xml, but fetchWithRetry seems used for JSON mostly.
          // If we expect JSON and get string, might be an issue unless configured otherwise.
        }

        return response.data;
      } catch (error: any) {
        const isLastAttempt = i === retries - 1;
        const status = error.response?.status;
        const errorMessage = error.message || String(error);

        // Handle specific "Unexpected end of JSON" which is likely a network truncation or malformed API response
        if (errorMessage.includes('Unexpected end of JSON') || errorMessage.includes('JSON')) {
          logger.warn('PubMedService', `JSON Parse Error on attempt ${i + 1}`, { url, error: errorMessage });
          // Retry immediately or with backoff, don't throw 429 logic
          await this.sleep(1000 * (i + 1));
          if (isLastAttempt) throw new Error(`PubMed API malformed response: ${errorMessage}`);
          continue;
        }

        if (status === 429) {
          const waitTime = 3000 * Math.pow(2, i);
          logger.warn('PubMedService', `Rate limit exceeded (429). Waiting ${waitTime}ms...`, { attempt: i + 1 });
          await this.sleep(waitTime);
          if (isLastAttempt) throw error;
          continue;
        }

        if (status === 404) throw error;

        if (isLastAttempt) {
          logger.error('PubMedService', `Request failed after ${retries} attempts`, {
            url, error: errorMessage
          });
          throw error;
        }
        await this.sleep(1000 * (i + 1));
      }
    }
    throw new Error('Retries exceeded');
  }

  async searchArticles(
    query: string,
    options: {
      maxResults?: number;
      year?: number;
      fromDate?: string;
      toDate?: string;
      publicationType?: string;
    } = {}
  ): Promise<string[]> {
    const {
      maxResults = 10000,
      year,
      fromDate,
      toDate,
      publicationType
    } = options;

    let searchQuery = query;

    if (year) {
      searchQuery += ` AND ${year}[pdat]`;
    }

    if (fromDate && toDate && fromDate.length >= 4 && toDate.length >= 4) {
      const formattedFrom = fromDate.replace(/-/g, '/');
      const formattedTo = toDate.replace(/-/g, '/');
      searchQuery += ` AND ("${formattedFrom}"[pdat] : "${formattedTo}"[pdat])`;
    }

    if (publicationType) {
      searchQuery += ` AND ${publicationType}[pt]`;
    }

    const params = new URLSearchParams({
      db: 'pubmed',
      term: searchQuery,
      retmax: maxResults.toString(),
      retmode: 'json',
      usehistory: 'y'
    });

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const cacheKey = `pubmed:search:${searchQuery}:${maxResults}`;
    const cached = cacheManager.get<string[]>(cacheKey);
    if (cached) {
      logger.info('PubMedService', `Cache HIT for search: ${query}`);
      return cached;
    }

    const url = `${this.baseURL}/esearch.fcgi?${params.toString()}`;

    logger.info('PubMedService', `Searching articles with query: ${query}`, {
      maxResults,
      year,
      url,
      finalQuery: searchQuery, // LOGGING THE FINAL QUERY
      options: { fromDate, toDate } // LOGGING OPTIONS
    });

    try {
      const response = await this.fetchWithRetry<PubMedSearchResult>(url);
      const idList = response.esearchresult?.idlist || [];

      logger.info('PubMedService', `Found ${response.esearchresult?.count} articles`, {
        returned: idList.length
      });

      cacheManager.set(cacheKey, idList, { ttl: 60 * 60 * 1000 });
      return idList;
    } catch (error) {
      logger.error('PubMedService', 'Failed to search articles', {
        query,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  async fetchArticleDetails(
    pmids: string[],
    webEnv?: string,
    queryKey?: string
  ): Promise<PubMedArticle[]> {
    if (pmids.length === 0) {
      return [];
    }

    const allArticles: PubMedArticle[] = [];
    const batchSize = 200;

    // Use a unique cache key based on the IDs
    const sortedIds = [...pmids].sort();
    const cacheKey = `pubmed:details:${sortedIds.length}:${sortedIds[0]}:${sortedIds[sortedIds.length - 1]}`;
    const cached = cacheManager.get<PubMedArticle[]>(cacheKey);
    if (cached) {
      logger.info('PubMedService', `Cache HIT for details: ${pmids.length} articles`);
      return cached;
    }

    try {
      for (let i = 0; i < pmids.length; i += batchSize) {
        const batchIds = pmids.slice(i, i + batchSize);
        const params = new URLSearchParams({
          db: 'pubmed',
          id: batchIds.join(','),
          retmode: 'xml',
          rettype: 'abstract'
        });

        if (webEnv) params.append('WebEnv', webEnv);
        if (queryKey) params.append('query_key', queryKey);
        if (this.apiKey) params.append('api_key', this.apiKey);

        const url = `${this.baseURL}/efetch.fcgi?${params.toString()}`;

        try {
          const xml = await this.fetchWithRetry<string>(url);
          const articles = this.parsePubMedXml(xml);
          allArticles.push(...articles);
        } catch (error) {
          logger.error('PubMedService', `Failed to fetch batch starting at ${i}`, { error });
        }
      }

      logger.info('PubMedService', `Fetched and parsed total ${allArticles.length} article details`);
      cacheManager.set(cacheKey, allArticles, { ttl: 4 * 60 * 60 * 1000 });
      return allArticles;
    } catch (error) {
      logger.error('PubMedService', 'Critical failure in fetchArticleDetails', { error });
      throw error;
    }
  }

  private parsePubMedXml(xml: string): PubMedArticle[] {
    const articles: PubMedArticle[] = [];
    const articleBlocks = xml.split('</PubmedArticle>');

    for (const block of articleBlocks) {
      if (!block.includes('<PubmedArticle')) continue;

      const pmidMatch = block.match(/<PMID[^>]*>(.*?)<\/PMID>/);
      const titleMatch = block.match(/<ArticleTitle[^>]*>(.*?)<\/ArticleTitle>/);
      const abstractMatch = block.match(/<AbstractText[^>]*>(.*?)<\/AbstractText>/g);
      const issnMatch = block.match(/<ISSN[^>]*>(.*?)<\/ISSN>/);
      const doiMatch = block.match(/<ArticleId IdType="doi">(.*?)<\/ArticleId>/);

      const authors: any[] = [];
      const authorMatches = block.matchAll(/<Author ValidYN="Y">(.*?)<\/Author>/gs);
      for (const auth of authorMatches) {
        const last = auth[1].match(/<LastName>(.*?)<\/LastName>/)?.[1];
        const fore = auth[1].match(/<ForeName>(.*?)<\/ForeName>/)?.[1];
        if (last) {
          authors.push({ name: fore ? `${last} ${fore}` : last });
        }
      }

      const yearMatch = block.match(/<PubDate>.*?<Year>(.*?)<\/Year>.*?<\/PubDate>/s);

      if (pmidMatch && titleMatch) {
        let abstractText = '';
        if (abstractMatch) {
          abstractText = abstractMatch
            .map(m => m.replace(/<\/?AbstractText[^>]*>/g, ''))
            .join(' ');
        }

        articles.push({
          uid: pmidMatch[1],
          title: titleMatch[1],
          abstractText: abstractText,
          authors: authors,
          doi: doiMatch ? doiMatch[1] : undefined,
          journalInfo: {
            title: '',
            pubDate: yearMatch ? yearMatch[1] : ''
          },
          issn: issnMatch ? issnMatch[1] : undefined
        });
      }
    }
    return articles;
  }

  async getArticles(
    query: string,
    options: {
      maxResults?: number;
      fromDate?: string;
      toDate?: string;
      fetchCitations?: boolean;
    } = {}
  ): Promise<{
    articles: Array<{
      id: string;
      title: string;
      abstract: string;
      authors: string[];
      year: number;
      keywords: string[];
      citations: string[];
      doi: string;
      issn: string;
      url: string;
      published: boolean;
    }>;
    total: number;
  }> {
    const { maxResults = 10000, fromDate, toDate, fetchCitations = true } = options;

    try {
      const pmids = await this.searchArticles(query, { maxResults, fromDate, toDate });

      if (pmids.length === 0) {
        return { articles: [], total: 0 };
      }

      const pubmedArticles = await this.fetchArticleDetails(pmids);

      const articles = await Promise.all(pubmedArticles.map(async (pubmedArticle) => {
        const year = pubmedArticle.journalInfo?.pubDate
          ? parseInt(pubmedArticle.journalInfo.pubDate.substring(0, 4))
          : new Date().getFullYear();

        const keywords = pubmedArticle.keywords?.map(k => k.name) || [];
        const authors = pubmedArticle.authors?.map(a => a.name || '') || [];

        let citations: string[] = [];

        if (fetchCitations) {
          const citationsQuery = `"${pubmedArticle.title}"[ti]`;
          try {
            const citationResults = await this.searchArticles(citationsQuery, { maxResults: 10 });
            citations = citationResults.filter(id => id !== pubmedArticle.uid);
          } catch (e) {
            // Silently skip if citation lookup fails
          }
        }

        return {
          id: pubmedArticle.uid,
          title: pubmedArticle.title || 'Untitled',
          abstract: pubmedArticle.abstractText || '',
          authors,
          year,
          keywords: pubmedArticle.meshTerms || keywords,
          citations,
          doi: pubmedArticle.doi || '',
          issn: pubmedArticle.issn || '',
          url: `https://pubmed.ncbi.nlm.nih.gov/${pubmedArticle.uid}/`,
          published: true
        };
      }));

      return {
        articles,
        total: pmids.length
      };
    } catch (error) {
      logger.error('PubMedService', 'Failed to get articles', {
        query,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  async getCitationNetwork(
    query: string,
    options: {
      maxArticles?: number;
      maxCitations?: number;
      depth?: number;
    } = {}
  ): Promise<{
    nodes: Array<{
      id: string;
      label: string;
      data: any;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      weight?: number;
    }>;
  }> {
    const { maxArticles = 20, maxCitations = 10, depth = 1 } = options;

    logger.warn('PubMedService', 'Citation network disabled to prevent rate limits');
    return {
      nodes: [],
      edges: []
    } as any;
  }
}

export const pubmedService = new PubMedService();
export default PubMedService;
