import { databaseManager } from '../core/Database'
import { SourceDownloader } from './sourceDownload'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { logger } from '../core/Logger'

export class BatchPdfDownloader {
    private downloader: SourceDownloader
    private outputDir: string

    constructor() {
        this.downloader = new SourceDownloader()
        this.outputDir = path.join(process.cwd(), 'storage/pdfs')
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true })
        }
    }

    /**
     * Start batch download for a job's articles
     */
    async startBatchDownload(jobId: string, articleIds: string[], userId: string) {
        const job = await databaseManager.getJob(jobId, userId)
        if (!job) throw new Error('Job not found')

        // Filter valid articles
        const targets = job.articles.filter((a: any) =>
            articleIds.includes(a.id) && !a.pdfUrl && a.doi
        )

        logger.info('BatchDownload', `Starting batch download for ${targets.length} articles`, { jobId })

        // Process in chunks to avoid rate limits
        for (const article of targets) {
            this.downloadArticle(article, userId, jobId).catch(err => {
                logger.error('BatchDownload', `Failed to download ${article.id}`, { error: err.message })
            })
        }

        return { message: `Started download for ${targets.length} articles` }
    }

    /**
     * Attempt to find and download PDF for a single article
     */
    private async downloadArticle(article: any, userId: string, jobId: string) {
        try {
            // 1. Check Unpaywall for OA link
            const doi = article.doi
            if (!doi) return

            const unpaywallUrl = `https://api.unpaywall.org/v2/${doi}?email=researcher@graphproject.org`
            const response = await axios.get(unpaywallUrl)
            const oaLocation = response.data.best_oa_location

            if (oaLocation && oaLocation.url_for_pdf) {
                const pdfUrl = oaLocation.url_for_pdf
                const filename = `${article.id}.pdf`
                const localPath = path.join(this.outputDir, filename)

                // 2. Download PDF
                await this.downloader.downloadFile(pdfUrl, localPath)

                // 3. Update Article record
                await databaseManager.updateArticle(article.id, userId, {
                    pdfUrl: `/storage/pdfs/${filename}`,
                    status: 'completed', // Or specific PDF status field if available
                    metadata: {
                        ...article.metadata,
                        pdfStatus: 'downloaded',
                        pdfLocalPath: localPath,
                        pdfSource: 'unpaywall'
                    }
                })

                logger.info('BatchDownload', `Downloaded PDF for ${article.id}`, { url: pdfUrl })
            } else {
                // Mark as not found or paywalled
                await databaseManager.updateArticle(article.id, userId, {
                    metadata: {
                        ...article.metadata,
                        pdfStatus: response.data.is_oa ? 'available-html' : 'paywall'
                    }
                })
            }

        } catch (error) {
            console.error(`Error downloading PDF for ${article.id}:`, error)
        }
    }
}

export const batchPdfDownloader = new BatchPdfDownloader()
