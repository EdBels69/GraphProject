
import { ISearchSource, SearchSourceOptions } from './ISearchSource'
import { SearchResult } from '../../globalSearch'
import { pubmedService } from '../../pubmedService'
import { logger } from '../../../core/Logger'

export class PubMedSource implements ISearchSource {
    name = 'pubmed'

    async search(query: string, options?: SearchSourceOptions): Promise<SearchResult[]> {
        try {
            const { articles } = await pubmedService.getArticles(query, {
                maxResults: options?.maxResults,
                // sortBy is not directly supported by getArticles but by searchArticles inside. 
                // However, getArticles signature is (query, options: { maxResults, year, fromDate, toDate, fetchCitations }).
                // We need to pass fromDate/toDate correctly.
                fromDate: options?.fromDate,
                toDate: options?.toDate,
                fetchCitations: false
            })

            return articles.map(article => ({
                id: `pubmed-${article.id}`,
                source: 'pubmed' as const,
                title: article.title,
                authors: article.authors,
                year: article.year,
                abstract: article.abstract,
                doi: article.doi,
                url: article.url,
                citations: undefined,
                relevanceScore: 1 // We can't easily calc score here without GlobalSearch logic, maybe default to 1?
                // Or we can duplicate the relevance logic, but that violates DRY.
                // For now, let's trust PubMed's ranking or set a default.
                // GlobalSearch re-calculates score anyway if this is used within GlobalSearch.
            }))
        } catch (error) {
            logger.error('PubMedSource', `Search failed for query: ${query}`, { error })
            return []
        }
    }
}
