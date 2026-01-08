import fs from 'fs'
import path from 'path'
import { logger } from '../../src/core/Logger'

export class FileStorage {
    private baseDir: string

    constructor() {
        this.baseDir = path.join(process.cwd(), 'downloads')
        this.ensureDir(this.baseDir)
    }

    private ensureDir(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    }

    async savePDF(jobId: string, filename: string, buffer: Buffer): Promise<string> {
        const jobDir = path.join(this.baseDir, jobId)
        this.ensureDir(jobDir)

        // Sanitize filename
        const safeName = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf'
        const filePath = path.join(jobDir, safeName)

        await fs.promises.writeFile(filePath, buffer)
        logger.info('FileStorage', `Saved PDF: ${filePath}`)

        return filePath
    }

    async getPDFPath(jobId: string, filename: string): Promise<string | null> {
        const jobDir = path.join(this.baseDir, jobId)
        const safeName = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf'
        const filePath = path.join(jobDir, safeName)

        if (fs.existsSync(filePath)) {
            return filePath
        }
        return null
    }
}

export const fileStorage = new FileStorage()
