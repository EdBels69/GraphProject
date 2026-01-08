import axios from 'axios'
import { promises as fs } from 'fs'
import path from 'path'
import { createWriteStream } from 'fs'

export interface DownloadJob {
  id: string
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled'
  total: number
  completed: number
  failed: number
  results: DownloadResult[]
  startTime: Date
  endTime?: Date
  error?: string
}

export interface DownloadRequest {
  urls: string[]
  outputDir: string
  maxConcurrent?: number
  retryAttempts?: number
  timeout?: number
}

export interface DownloadResult {
  url: string
  fileName: string
  filePath: string
  status: 'success' | 'failed'
  error?: string
  size?: number
  contentType?: string
}

export class SourceDownloader {
  private jobs: Map<string, DownloadJob>
  private activeDownloads: Set<string>

  constructor() {
    this.jobs = new Map()
    this.activeDownloads = new Set()
  }

  /**
   * Download multiple sources as a batch job
   */
  async downloadBatch(request: DownloadRequest): Promise<DownloadJob> {
    const {
      urls,
      outputDir,
      maxConcurrent = 5,
      retryAttempts = 3,
      timeout = 30000
    } = request

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const job: DownloadJob = {
      id: jobId,
      status: 'pending',
      total: urls.length,
      completed: 0,
      failed: 0,
      results: [],
      startTime: new Date()
    }

    this.jobs.set(jobId, job)

    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true })

    // Start downloading
    this.processDownloads(
      urls,
      outputDir,
      maxConcurrent,
      retryAttempts,
      timeout,
      job
    ).then(() => {
      job.status = 'completed'
      job.endTime = new Date()
    }).catch(error => {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : String(error)
      job.endTime = new Date()
    })

    return job
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): DownloadJob | undefined {
    return this.jobs.get(jobId)
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId)
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false
    }

    job.status = 'cancelled'
    job.endTime = new Date()

    // Cancel active downloads
    for (const url of this.activeDownloads) {
      this.activeDownloads.delete(url)
    }

    return true
  }

  /**
   * Download a single URL
   */
  async downloadSingle(
    url: string,
    outputDir: string,
    retryAttempts: number = 3,
    timeout: number = 30000
  ): Promise<DownloadResult> {
    let lastError: string | undefined

    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout,
          responseType: 'stream',
          maxRedirects: 5
        })

        // Generate filename from URL or Content-Disposition header
        let fileName = this.extractFileName(url, response.headers as Record<string, string>)
        const filePath = path.join(outputDir, fileName)

        // Stream to file
        const writer = createWriteStream(filePath)
        response.data.pipe(writer)

        await new Promise<void>((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })

        // Get file size
        const stats = await fs.stat(filePath)

        return {
          url,
          fileName,
          filePath,
          status: 'success',
          size: stats.size,
          contentType: response.headers['content-type']
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)

        // Wait before retry
        if (attempt < retryAttempts - 1) {
          await this.sleep(1000 * (attempt + 1))
        }
      }
    }

    return {
      url,
      fileName: '',
      filePath: '',
      status: 'failed',
      error: lastError
    }
  }

  /**
   * Process downloads with concurrency control
   */
  private async processDownloads(
    urls: string[],
    outputDir: string,
    maxConcurrent: number,
    retryAttempts: number,
    timeout: number,
    job: DownloadJob
  ): Promise<void> {
    job.status = 'downloading'

    const queue = [...urls]
    const active = new Set<Promise<DownloadResult>>()

    while (queue.length > 0 || active.size > 0) {
      // Start new downloads up to concurrency limit
      while (queue.length > 0 && active.size < maxConcurrent) {
        const url = queue.shift()!
        this.activeDownloads.add(url)

        const downloadPromise = this.downloadSingle(url, outputDir, retryAttempts, timeout)
          .then(result => {
            this.activeDownloads.delete(url)
            job.results.push(result)
            if (result.status === 'success') {
              job.completed++
            } else {
              job.failed++
            }
            return result
          })
          .catch(error => {
            this.activeDownloads.delete(url)
            const failedResult: DownloadResult = {
              url,
              fileName: '',
              filePath: '',
              status: 'failed',
              error: error instanceof Error ? error.message : String(error)
            }
            job.results.push(failedResult)
            job.failed++
            return failedResult
          })

        active.add(downloadPromise)
      }

      // Wait for at least one download to complete
      if (active.size > 0) {
        await Promise.race(active)
        // Remove completed promises
        for (const promise of active) {
          if (promise.toString().includes('fulfilled')) {
            active.delete(promise)
          }
        }
      }
    }
  }

  /**
   * Extract filename from URL or headers
   */
  private extractFileName(url: string, headers: Record<string, string>): string {
    // Check Content-Disposition header
    const contentDisposition = headers['content-disposition']
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (match) {
        return match[1].replace(/['"]/g, '')
      }
    }

    // Extract from URL
    const urlPath = new URL(url).pathname
    const fileName = path.basename(urlPath)

    // If no extension, add .pdf
    if (!path.extname(fileName)) {
      return `${fileName}.pdf`
    }

    return fileName
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get all jobs
   */
  getAllJobs(): DownloadJob[] {
    return Array.from(this.jobs.values())
  }

  /**
   * Clean up old jobs
   */
  cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    for (const [jobId, job] of this.jobs) {
      const age = now - job.startTime.getTime()
      if (age > maxAge && (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')) {
        this.jobs.delete(jobId)
      }
    }
  }

  /**
   * Get job statistics
   */
  getJobStatistics(jobId: string): {
    progress: number
    successRate: number
    averageSpeed: number
  } | null {
    const job = this.jobs.get(jobId)
    if (!job) {
      return null
    }

    const progress = job.total > 0 ? (job.completed + job.failed) / job.total : 0
    const successRate = (job.completed + job.failed) > 0 ? job.completed / (job.completed + job.failed) : 0

    const elapsed = (job.endTime || new Date()).getTime() - job.startTime.getTime()
    const averageSpeed = elapsed > 0 ? (job.completed + job.failed) / (elapsed / 1000) : 0

    return {
      progress,
      successRate,
      averageSpeed
    }
  }

  /**
   * Validate URL before downloading
   */
  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Check if URL is accessible
   */
  async checkUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        maxRedirects: 5
      })
      return response.status >= 200 && response.status < 400
    } catch {
      return false
    }
  }
}

export default new SourceDownloader()
