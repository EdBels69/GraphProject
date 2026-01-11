import axios from 'axios';
import { logger } from '../core/Logger';

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
  pmid?: string;
  doi?: string;
  pmc?: string;
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
  private requestDelay: number;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PUBMED_API_KEY || '';
    // Limit is 3 req/s without key/334ms, 10 req/s with key/100ms.
    this.requestDelay = this.apiKey ? 200 : 500;
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry<T>(
    url: string,
    retries = this.maxRetries
  ): Promise<any> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.sleep(this.requestDelay);
        const response = await axios.get(url, {
          timeout: 30000,
          headers: { 'User-Agent': 'GraphAnalyser/1.0' }
        });
        return response.data;
      } catch (error: any) {
        const isLastAttempt = i === retries - 1;
        const status = error.response?.status;

        if (status === 429) {
          logger.warn('PubMedService', `Rate limit exceeded (429). Waiting...`, { attempt: i + 1 });
          // Exponential backoff
          await this.sleep(2000 * Math.pow(2, i));
          if (isLastAttempt) throw error;
          continue;
        }

        if (status === 404) throw error;

        if (isLastAttempt) {
          logger.error('PubMedService', `Request failed after ${retries} attempts`, {
            url, error: error.message
          });
          throw error;
        }
        await this.sleep(1000);
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
      maxResults = 20,
      year,
      fromDate,
      toDate,
      publicationType
    } = options;

    let searchQuery = query;

    if (year) {
      searchQuery += ` AND ${year}[pdat]`;
    }

    if (fromDate && toDate) {
      searchQuery += ` AND ("${fromDate}"[pdat] : "${toDate}"[pdat])`;
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

    const url = `${this.baseURL}/esearch.fcgi?${params.toString()}`;

    logger.info('PubMedService', `Searching articles with query: ${query}`, {
      maxResults,
      year,
      url // Log the URL
    });

    try {
      const response = await this.fetchWithRetry<PubMedSearchResult>(url);
      logger.info('PubMedService', `Raw PubMed response status: 200`, { data: response })
      const result = response;

      if (!result.esearchresult) {
        // Handle different response structure?
        logger.warn('PubMedService', 'Response missing esearchresult', { data: result })
      }

      const idList = result.esearchresult?.idlist || []

      logger.info('PubMedService', `Found ${result.esearchresult?.count} articles`, {
        returned: idList.length
      });

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

    // Use retmode=xml because efetch JSON is not supported/reliable for PubMed
    const params = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      rettype: 'abstract'
    });

    if (webEnv) params.append('WebEnv', webEnv);
    if (queryKey) params.append('query_key', queryKey);
    if (this.apiKey) params.append('api_key', this.apiKey);

    const url = `${this.baseURL}/efetch.fcgi?${params.toString()}`;

    logger.info('PubMedService', `Fetching details for ${pmids.length} articles (XML)`);

    try {
      // Get raw XML text
      const xml = await this.fetchWithRetry<string>(url);

      const articles = this.parsePubMedXml(xml);

      logger.info('PubMedService', `Fetched and parsed ${articles.length} article details`);
      return articles;
    } catch (error) {
      logger.error('PubMedService', 'Failed to fetch article details', {
        pmids,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  private parsePubMedXml(xml: string): PubMedArticle[] {
    const articles: PubMedArticle[] = [];

    // Simple regex-based parsing to avoid heavy XML dependencies
    // Split by PubmedArticle to handle multiple articles
    const articleBlocks = xml.split('</PubmedArticle>');

    for (const block of articleBlocks) {
      if (!block.includes('<PubmedArticle')) continue;

      const pmidMatch = block.match(/<PMID[^>]*>(.*?)<\/PMID>/);
      const titleMatch = block.match(/<ArticleTitle[^>]*>(.*?)<\/ArticleTitle>/);
      const abstractMatch = block.match(/<AbstractText[^>]*>(.*?)<\/AbstractText>/g);

      // Authors
      const authors: any[] = [];
      const authorMatches = block.matchAll(/<Author ValidYN="Y">(.*?)<\/Author>/gs);
      for (const auth of authorMatches) {
        const last = auth[1].match(/<LastName>(.*?)<\/LastName>/)?.[1];
        const fore = auth[1].match(/<ForeName>(.*?)<\/ForeName>/)?.[1];
        if (last) {
          authors.push({ name: fore ? `${last} ${fore}` : last });
        }
      }

      // Date
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
          journalInfo: {
            title: '',
            pubDate: yearMatch ? yearMatch[1] : ''
          }
        });
      }
    }
    return articles;
  }

  async getArticles(
    query: string,
    options: {
      maxResults?: number;
      year?: number;
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
      url: string;
      published: boolean;
    }>;
    total: number;
  }> {
    const { maxResults = 20, year, fetchCitations = true } = options;

    try {
      const pmids = await this.searchArticles(query, { maxResults, year });

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
          const citationResults = await this.searchArticles(citationsQuery, { maxResults: 10 });
          citations = citationResults.filter(id => id !== pubmedArticle.uid);
        }

        return {
          id: pubmedArticle.uid,
          title: pubmedArticle.title || 'Untitled',
          abstract: pubmedArticle.abstractText || '',
          authors,
          year,
          keywords,
          citations,
          doi: pubmedArticle.doi || '',
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
      edges: [],
      metadata: { entities: 0, relations: 0, sources: [], createdAt: new Date() }
    } as any;

    logger.info('PubMedService', 'Building citation network', {
      query,
      maxArticles,
      depth
    });

    const nodes = new Map<string, any>();
    const edges = new Set<string>();
    const processedIds = new Set<string>();

    const processArticle = async (pmid: string, currentDepth: number): Promise<void> => {
      if (currentDepth > depth || processedIds.has(pmid)) {
        return;
      }

      processedIds.add(pmid);

      try {
        const details = await this.fetchArticleDetails([pmid]);

        if (details.length > 0) {
          const article = details[0];

          if (!nodes.has(pmid)) {
            nodes.set(pmid, {
              id: pmid,
              label: article.title.substring(0, 50),
              data: {
                title: article.title,
                authors: article.authors?.map(a => a.name) || [],
                year: article.journalInfo?.pubDate?.substring(0, 4) || new Date().getFullYear()
              }
            });
          }

          const citationsQuery = `"${article.title}"[ti]`;
          const citationIds = await this.searchArticles(citationsQuery, { maxResults: maxCitations });

          citationIds.forEach((citationId, index) => {
            const edgeId = `${pmid}-${citationId}`;

            if (!edges.has(edgeId) && citationId !== pmid) {
              edges.add(edgeId);

              processArticle(citationId, currentDepth + 1).catch(error => {
                logger.warn('PubMedService', `Failed to process citation ${citationId}`, {
                  error: error instanceof Error ? error.message : error
                });
              });
            }
          });
        }
      } catch (error) {
        logger.error('PubMedService', `Failed to process article ${pmid}`, {
          error: error instanceof Error ? error.message : error
        });
      }
    };

    const initialPmids = await this.searchArticles(query, { maxResults: maxArticles });

    await Promise.all(
      initialPmids.slice(0, 5).map(pmid => processArticle(pmid, 1))
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    const network = {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges).map(edgeId => {
        const [source, target] = edgeId.split('-');
        return {
          id: edgeId,
          source,
          target,
          weight: 1
        };
      })
    };

    logger.info('PubMedService', 'Citation network built', {
      nodes: network.nodes.length,
      edges: network.edges.length
    });

    return network;
  }
}

export const pubmedService = new PubMedService();
export default PubMedService;
