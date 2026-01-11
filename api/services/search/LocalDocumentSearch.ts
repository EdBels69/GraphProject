
import fs from 'fs'
import path from 'path'
import { fileStorage } from '../fileStorage'
import { logger } from '../../core/Logger'
import { jobManager } from '../jobs/JobManager'

export interface SearchHit {
    articleId?: string
    fileName: string
    snippet: string
    score: number
}

export class LocalDocumentSearch {

    /**
     * Search within downloaded documents for a specific job
     */
    async search(jobId: string, query: string): Promise<SearchHit[]> {
        const job = jobManager.getJob(jobId)
        if (!job) {
            throw new Error(`Job ${jobId} not found`)
        }

        const topic = job.topic
        const files = await fileStorage.getTextFiles(topic)
        const hits: SearchHit[] = []

        logger.info('LocalDocumentSearch', `Searching "${query}" in ${files.length} files for job ${jobId}`)

        for (const file of files) {
            try {
                const content = await fs.promises.readFile(file, 'utf-8')
                const score = this.calculateScore(content, query)

                if (score > 0) {
                    hits.push({
                        fileName: path.basename(file),
                        snippet: this.getSnippet(content, query),
                        score
                    })
                }
            } catch (err) {
                logger.warn('LocalDocumentSearch', `Error reading file ${file}`, { error: err })
            }
        }

        return hits.sort((a, b) => b.score - a.score)
    }

    private calculateScore(content: string, query: string): number {
        const lowerContent = content.toLowerCase()
        const lowerQuery = query.toLowerCase()

        // Simple count of occurrences
        const occurrences = lowerContent.split(lowerQuery).length - 1
        return occurrences
    }

    private getSnippet(content: string, query: string): string {
        const lowerContent = content.toLowerCase()
        const lowerQuery = query.toLowerCase()
        const index = lowerContent.indexOf(lowerQuery)

        if (index === -1) return content.slice(0, 200) + '...'

        const start = Math.max(0, index - 50)
        const end = Math.min(content.length, index + query.length + 100)

        return (start > 0 ? '...' : '') +
            content.slice(start, end).replace(/\s+/g, ' ') +
            (end < content.length ? '...' : '')
    }
}

export const localDocumentSearch = new LocalDocumentSearch()
