
import { ISearchSource, SearchSourceOptions } from './ISearchSource'
import { SearchResult } from '../../globalSearch'
import axios from 'axios'
import { logger } from '../../../core/Logger'

export class BioRxivSource implements ISearchSource {
    name = 'biorxiv'

    async search(query: string, options?: SearchSourceOptions): Promise<SearchResult[]> {
        try {
            const rows = options?.maxResults || 20
            // BioRxiv DOI prefix is 10.1101
            const prefixFilter = 'prefix:10.1101'

            let filter = prefixFilter
            if (options?.fromDate) {
                filter += `,from-pub-date:${options.fromDate},until-pub-date:${options.toDate || new Date().toISOString().split('T')[0]}`
            }

            const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${rows}&filter=${filter}`

            const response = await axios.get(url, {
                timeout: 10000,
                headers: { 'User-Agent': 'GraphAnalyser/1.0 (mailto:eduard.belskih@gmail.com)' }
            })

            const items = response.data?.message?.items || []

            return items.map((item: any) => ({
                id: item.DOI,
                source: 'biorxiv',
                title: item.title?.[0] || 'No Title',
                authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || [],
                year: item.published?.['date-parts']?.[0]?.[0],
                abstract: item.abstract?.replace(/<\/?jats:[^>]+>/g, ''), // Basic cleanup
                doi: item.DOI,
                url: item.URL,
                citations: item['is-referenced-by-count'] || 0,
                references: item.reference?.map((r: any) => r.DOI).filter((d: string) => !!d) || [],
                relevanceScore: item.score || 0
            }))
        } catch (error) {
            logger.error('BioRxivSource', `Search failed for query: ${query}`, { error })
            return []
        }
    }
}
