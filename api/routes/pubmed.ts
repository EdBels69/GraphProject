import express, { Request, Response } from 'express';
import { pubmedService } from '../services/pubmedService';
import { validatePubMedQuery } from '../../src/utils/validators';
import { createGraph } from '../../shared/types';
import { GraphStorage } from '../../shared/graphStorage';
import { logger } from '../../src/core/Logger';

const router = express.Router();

GraphStorage.initialize();

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, maxResults, year, publicationType } = req.query;

    const query = q as string;
    const validation = validatePubMedQuery({
      term: query,
      limit: maxResults ? parseInt(maxResults as string) : undefined
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const articles = await pubmedService.getArticles(query, {
      maxResults: maxResults ? parseInt(maxResults as string) : 20,
      year: year ? parseInt(year as string) : undefined
    });

    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    logger.error('PubMed Route', 'Search failed', {
      error: error instanceof Error ? error.message : error
    });

    res.status(500).json({
      success: false,
      error: 'Failed to search articles'
    });
  }
});

router.post('/network', async (req: Request, res: Response) => {
  try {
    const { query, maxArticles, maxCitations, depth } = req.body;

    const validation = validatePubMedQuery({
      term: query,
      limit: maxArticles
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const network = await pubmedService.getCitationNetwork(query, {
      maxArticles: maxArticles || 20,
      maxCitations: maxCitations || 10,
      depth: depth || 1
    });

    const graph = createGraph(`PubMed: ${query}`, false, network.nodes, network.edges);

    GraphStorage.save(graph);

    res.json({
      success: true,
      data: {
        graph,
        stats: {
          totalNodes: graph.nodes.length,
          totalEdges: graph.edges.length
        }
      }
    });
  } catch (error) {
    logger.error('PubMed Route', 'Network creation failed', {
      error: error instanceof Error ? error.message : error
    });

    res.status(500).json({
      success: false,
      error: 'Failed to create citation network'
    });
  }
});

router.get('/article/:pmid', async (req: Request, res: Response) => {
  try {
    const { pmid } = req.params;

    const articles = await pubmedService.fetchArticleDetails([pmid]);

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const article = articles[0];

    res.json({
      success: true,
      data: {
        id: article.uid,
        title: article.title,
        abstract: article.abstractText || '',
        authors: article.authors?.map(a => a.name) || [],
        year: article.journalInfo?.pubDate?.substring(0, 4) || new Date().getFullYear(),
        keywords: article.keywords?.map(k => k.name) || [],
        url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
        published: true
      }
    });
  } catch (error) {
    logger.error('PubMed Route', 'Article fetch failed', {
      pmid: req.params.pmid,
      error: error instanceof Error ? error.message : error
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch article'
    });
  }
});

export default router;
