import axios from 'axios';
import { logger } from '../../src/core/Logger';

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
  count: number;
  retmax: number;
  retstart: number;
  queryKey: string;
  webEnv: string;
  idList: string[];
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
  private retryDelay = 1000;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PUBMED_API_KEY || '';
  }

  private async fetchWithRetry<T>(
    url: string,
    retries = this.maxRetries
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get<T>(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'GraphAnalyser/1.0'
          }
        });
        return response.data;
      } catch (error) {
        const isLastAttempt = i === retries - 1;

        if (isLastAttempt) {
          logger.error('PubMedService', `Failed to fetch ${url}`, {
            error: error instanceof Error ? error.message : error,
            attempts: retries
          });
          throw error;
        }

        logger.warn('PubMedService', `Retry ${i + 1}/${retries} for ${url}`);
        await this.sleep(this.retryDelay * (i + 1));
      }
    }

    throw new Error('Max retries exceeded');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      year
    });

    try {
      const result = await this.fetchWithRetry<PubMedSearchResult>(url);
      logger.info('PubMedService', `Found ${result.count} articles`, {
        returned: result.idList.length
      });

      return result.idList;
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

    const params = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'json',
      rettype: 'abstract'
    });

    if (webEnv) {
      params.append('WebEnv', webEnv);
    }

    if (queryKey) {
      params.append('query_key', queryKey);
    }

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const url = `${this.baseURL}/efetch.fcgi?${params.toString()}`;

    logger.info('PubMedService', `Fetching details for ${pmids.length} articles`);

    try {
      const result = await this.fetchWithRetry<PubMedArticleDetails>(url);
      const articles: PubMedArticle[] = [];

      pmids.forEach(pmid => {
        const article = result.result[pmid];
        if (article && typeof article === 'object' && !Array.isArray(article)) {
          articles.push(article);
        }
      });

      logger.info('PubMedService', `Fetched ${articles.length} article details`);

      return articles;
    } catch (error) {
      logger.error('PubMedService', 'Failed to fetch article details', {
        pmids,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
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
