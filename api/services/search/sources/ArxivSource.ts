
import axios from 'axios'
import { ISearchSource, SearchSourceOptions } from './ISearchSource'
import { SearchResult } from '../../globalSearch'
import { logger } from '../../../core/Logger'

export class ArxivSource implements ISearchSource {
    name = 'arxiv'
    private readonly API_URL = 'http://export.arxiv.org/api/query'

    async search(query: string, options?: SearchSourceOptions): Promise<SearchResult[]> {
        const maxResults = options?.maxResults || 20

        try {
            // ArXiv API supports: search_query=all:electron&start=0&max_results=10
            const response = await axios.get(this.API_URL, {
                params: {
                    search_query: `all:${query}`,
                    start: 0,
                    max_results: maxResults,
                    sortBy: options?.sortBy === 'date' ? 'submittedDate' : 'relevance',
                    sortOrder: 'descending'
                }
            })

            return this.parseResponse(response.data)
        } catch (error) {
            logger.error('ArxivSource', `Search failed for query: ${query}`, { error })
            return []
        }
    }

    private parseResponse(xml: string): SearchResult[] {
        const results: SearchResult[] = []

        // Simple regex parsing for Atom feed
        // Match each <entry> block
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
        let match

        while ((match = entryRegex.exec(xml)) !== null) {
            const entry = match[1]

            const idMatch = /<id>(.*?)<\/id>/.exec(entry)
            const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(entry)
            const summaryMatch = /<summary>([\s\S]*?)<\/summary>/.exec(entry)
            const publishedMatch = /<published>(.*?)<\/published>/.exec(entry)
            const doiMatch = /<arxiv:doi>(.*?)<\/arxiv:doi>/.exec(entry)

            // Extract authors
            const authors: string[] = []
            const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g
            let authorMatch
            while ((authorMatch = authorRegex.exec(entry)) !== null) {
                authors.push(authorMatch[1])
            }

            // Extract ID (clean up http://arxiv.org/abs/ from it)
            const rawId = idMatch ? idMatch[1] : ''
            const id = rawId.replace('http://arxiv.org/abs/', '').replace(/v\d+$/, '') // remove version

            if (id) {
                results.push({
                    id: `arxiv-${id}`,
                    source: 'arxiv',
                    title: titleMatch ? titleMatch[1].replace(/\n/g, ' ').trim() : 'Untitled',
                    authors: authors,
                    year: publishedMatch ? new Date(publishedMatch[1]).getFullYear() : undefined,
                    abstract: summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim() : undefined,
                    url: rawId,
                    doi: doiMatch ? doiMatch[1] : undefined,
                    relevanceScore: 1 // Default
                })
            }
        }

        return results
    }
}
