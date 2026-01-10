/**
 * Unpaywall Service - Find Open Access PDFs
 * 
 * Uses Unpaywall API to find free legal PDFs via DOI
 * API Docs: https://unpaywall.org/products/api
 */

import axios from 'axios'
import { logger } from '../core/Logger'

export interface UnpaywallResult {
    doi: string
    title?: string
    isOpenAccess: boolean
    pdfUrl?: string
    oaStatus?: 'gold' | 'green' | 'hybrid' | 'bronze' | 'closed'
    publisher?: string
}

export class UnpaywallService {
    private baseUrl = 'https://api.unpaywall.org/v2'
    private email: string

    constructor(email?: string) {
        // Unpaywall requires an email for API access (free, no key needed)
        this.email = email || process.env.UNPAYWALL_EMAIL || 'graphanalyser@example.com'
    }

    /**
     * Find PDF URL for a single DOI
     */
    async findPdfUrl(doi: string): Promise<UnpaywallResult> {
        try {
            const encodedDoi = encodeURIComponent(doi)
            const url = `${this.baseUrl}/${encodedDoi}?email=${this.email}`

            const response = await axios.get(url, { timeout: 10000 })
            const data = response.data

            const result: UnpaywallResult = {
                doi,
                title: data.title,
                isOpenAccess: data.is_oa || false,
                oaStatus: data.oa_status,
                publisher: data.publisher
            }

            // Find best PDF URL
            if (data.best_oa_location?.url_for_pdf) {
                result.pdfUrl = data.best_oa_location.url_for_pdf
            } else if (data.best_oa_location?.url) {
                result.pdfUrl = data.best_oa_location.url
            }

            logger.info('UnpaywallService', `Found ${result.isOpenAccess ? 'OA' : 'closed'} for ${doi}`)

            return result
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                logger.info('UnpaywallService', `DOI not found: ${doi}`)
                return { doi, isOpenAccess: false }
            }

            logger.error('UnpaywallService', `Error looking up ${doi}`, { error })
            return { doi, isOpenAccess: false }
        }
    }

    /**
     * Find PDF URLs for multiple DOIs
     */
    async batchFindPdfs(
        dois: string[],
        options: { maxConcurrent?: number; delayMs?: number } = {}
    ): Promise<Map<string, UnpaywallResult>> {
        const { maxConcurrent = 3, delayMs = 100 } = options
        const results = new Map<string, UnpaywallResult>()

        // Process in batches to respect rate limits
        for (let i = 0; i < dois.length; i += maxConcurrent) {
            const batch = dois.slice(i, i + maxConcurrent)

            const batchResults = await Promise.all(
                batch.map(doi => this.findPdfUrl(doi))
            )

            for (const result of batchResults) {
                results.set(result.doi, result)
            }

            // Rate limiting delay
            if (i + maxConcurrent < dois.length) {
                await this.sleep(delayMs)
            }
        }

        logger.info('UnpaywallService', `Batch lookup complete`, {
            total: dois.length,
            openAccess: Array.from(results.values()).filter(r => r.isOpenAccess).length
        })

        return results
    }

    /**
     * Get statistics about Open Access availability
     */
    getStats(results: Map<string, UnpaywallResult>): {
        total: number
        openAccess: number
        withPdf: number
        byStatus: Record<string, number>
    } {
        const values = Array.from(results.values())
        const byStatus: Record<string, number> = {}

        for (const r of values) {
            const status = r.oaStatus || 'closed'
            byStatus[status] = (byStatus[status] || 0) + 1
        }

        return {
            total: values.length,
            openAccess: values.filter(r => r.isOpenAccess).length,
            withPdf: values.filter(r => !!r.pdfUrl).length,
            byStatus
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

export const unpaywallService = new UnpaywallService()
export default UnpaywallService
