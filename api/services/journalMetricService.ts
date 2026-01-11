import axios from 'axios'
import { logger } from '../core/Logger'
import cacheManager from './cacheManager'

export interface JournalMetrics {
    issn: string
    title: string
    impactFactor?: number
    scopusQuartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    wosQuartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    sjrQuartile?: 'Q1' | 'Q2' | 'Q3' | 'Q4'
    updatedAt: string
}

export class JournalMetricService {
    private openAlexBaseUrl = 'https://api.openalex.org/venues'

    /**
     * Fetch metrics for a journal by ISSN
     */
    async getMetricsByIssn(issn: string): Promise<JournalMetrics | null> {
        const cacheKey = `metrics:issn:v3:${issn}`
        const cached = cacheManager.get<JournalMetrics>(cacheKey)
        if (cached) return cached

        try {
            const response = await axios.get(this.openAlexBaseUrl, {
                params: {
                    filter: `issn:${issn}`,
                    select: 'display_name,ids,summary_stats,type'
                },
                timeout: 5000
            })

            const venue = response.data.results?.[0]
            if (!venue) return null

            const impactScore = venue.summary_stats?.['2yr_mean_citedness'] || 0

            const getQuartile = (score: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
                if (score > 5.0) return 'Q1'
                if (score > 2.5) return 'Q2'
                if (score > 1.0) return 'Q3'
                return 'Q4'
            }

            const q = getQuartile(impactScore)

            const metrics: JournalMetrics = {
                issn,
                title: venue.display_name,
                impactFactor: parseFloat(impactScore.toFixed(2)),
                scopusQuartile: q,
                wosQuartile: q,
                sjrQuartile: q,
                updatedAt: new Date().toISOString()
            }

            cacheManager.set(cacheKey, metrics, { ttl: 30 * 24 * 60 * 60 * 1000 })
            return metrics
        } catch (error) {
            logger.warn('JournalMetricService', `Failed to fetch metrics for ${issn}`, { error })
            return null
        }
    }

    /**
     * Batch enrich articles with metrics
     */
    async enrichArticles(articles: any[]): Promise<any[]> {
        const enriched = [...articles]
        const issnMap = new Map<string, JournalMetrics>()

        for (const article of enriched) {
            if (article.issn) {
                let metrics = issnMap.get(article.issn)
                if (!metrics) {
                    metrics = await this.getMetricsByIssn(article.issn) || undefined
                    if (metrics) issnMap.set(article.issn, metrics)
                }

                if (metrics) {
                    article.scopusQuartile = metrics.scopusQuartile
                    article.wosQuartile = metrics.wosQuartile
                    article.sjrQuartile = metrics.sjrQuartile
                    article.impactFactor = metrics.impactFactor
                    article.journal = metrics.title || article.journal
                }
            }
        }

        return enriched
    }
}

export const journalMetricService = new JournalMetricService()
