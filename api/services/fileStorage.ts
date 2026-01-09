import fs from 'fs'
import path from 'path'
import { logger } from '../../src/core/Logger'

/**
 * Article metadata for smart file naming
 */
export interface ArticleMetadata {
    year?: number
    authors?: string[]
    title?: string
    keywords?: string[]
    doi?: string
}

export class FileStorage {
    private baseDir: string

    constructor() {
        // Папка downloads в корне проекта
        this.baseDir = path.join(process.cwd(), 'downloads')
        this.ensureDir(this.baseDir)
    }

    private ensureDir(dir: string) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    }

    /**
     * Sanitize string for use in file/folder names
     */
    private sanitize(str: string): string {
        return str
            .replace(/[<>:"/\\|?*]/g, '')  // Запрещённые символы
            .replace(/\s+/g, '_')           // Пробелы → подчёркивания
            .replace(/_+/g, '_')            // Множественные подчёркивания → одно
            .slice(0, 50)                   // Ограничение длины
            .trim()
    }

    /**
     * Extract first author's last name
     */
    private getFirstAuthor(authors?: string[]): string {
        if (!authors || authors.length === 0) return 'Unknown'
        const first = authors[0]
        // Берём последнее слово (обычно фамилия)
        const parts = first.split(/[\s,]+/)
        return parts[parts.length - 1] || parts[0] || 'Unknown'
    }

    /**
     * Get main keyword from title or keywords list
     */
    private getKeyword(title?: string, keywords?: string[]): string {
        if (keywords && keywords.length > 0) {
            return this.sanitize(keywords[0])
        }
        if (title) {
            // Берём значимое слово из заголовка (не артикли)
            const stopWords = ['the', 'a', 'an', 'of', 'in', 'on', 'for', 'and', 'or', 'to', 'with']
            const words = title.toLowerCase().split(/\s+/)
            const keyword = words.find(w => w.length > 3 && !stopWords.includes(w))
            return keyword ? this.sanitize(keyword) : 'article'
        }
        return 'article'
    }

    /**
     * Generate human-readable filename: 2024_Smith_proteomics.pdf
     */
    generateFileName(metadata: ArticleMetadata): string {
        const year = metadata.year || new Date().getFullYear()
        const author = this.sanitize(this.getFirstAuthor(metadata.authors))
        const keyword = this.getKeyword(metadata.title, metadata.keywords)

        return `${year}_${author}_${keyword}.pdf`
    }

    /**
     * Generate topic-based folder name
     */
    generateFolderName(topic: string): string {
        const date = new Date().toISOString().slice(0, 10)  // YYYY-MM-DD
        const sanitizedTopic = this.sanitize(topic)
        return `${date}_${sanitizedTopic}`
    }

    /**
     * Save PDF with smart naming
     * @param topic Research topic for folder name
     * @param metadata Article metadata for filename
     * @param buffer PDF file content
     */
    async savePDF(topic: string, metadata: ArticleMetadata, buffer: Buffer): Promise<string> {
        // Создаём папку по теме исследования
        const folderName = this.generateFolderName(topic)
        const topicDir = path.join(this.baseDir, folderName)
        this.ensureDir(topicDir)

        // Генерируем читаемое имя файла
        let fileName = this.generateFileName(metadata)
        let filePath = path.join(topicDir, fileName)

        // Если файл существует — добавляем счётчик
        let counter = 1
        while (fs.existsSync(filePath)) {
            const baseName = fileName.replace('.pdf', '')
            filePath = path.join(topicDir, `${baseName}_${counter}.pdf`)
            counter++
        }

        await fs.promises.writeFile(filePath, buffer)
        logger.info('FileStorage', `Saved PDF: ${filePath}`)

        return filePath
    }

    /**
     * Legacy method for backward compatibility
     */
    async savePDFLegacy(jobId: string, filename: string, buffer: Buffer): Promise<string> {
        const jobDir = path.join(this.baseDir, jobId)
        this.ensureDir(jobDir)

        const safeName = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf'
        const filePath = path.join(jobDir, safeName)

        await fs.promises.writeFile(filePath, buffer)
        logger.info('FileStorage', `Saved PDF (legacy): ${filePath}`)

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

    /**
     * List all research folders
     */
    listResearchFolders(): string[] {
        if (!fs.existsSync(this.baseDir)) return []
        return fs.readdirSync(this.baseDir)
            .filter(f => fs.statSync(path.join(this.baseDir, f)).isDirectory())
            .sort()
            .reverse()  // Новые сверху
    }

    /**
     * Get total storage size
     */
    getStorageStats(): { folders: number; files: number; sizeBytes: number } {
        let files = 0
        let sizeBytes = 0
        const folders = this.listResearchFolders()

        for (const folder of folders) {
            const folderPath = path.join(this.baseDir, folder)
            const entries = fs.readdirSync(folderPath)
            for (const entry of entries) {
                const stat = fs.statSync(path.join(folderPath, entry))
                if (stat.isFile()) {
                    files++
                    sizeBytes += stat.size
                }
            }
        }

        return { folders: folders.length, files, sizeBytes }
    }
}

export const fileStorage = new FileStorage()

