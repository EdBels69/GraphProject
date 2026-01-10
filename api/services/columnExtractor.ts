import fs from 'fs'
import path from 'path'
import { chatCompletion } from './aiService'
import { ArticleSource } from '../../shared/contracts/research'
import { logger } from '../../src/core/Logger'

// Contract for Column Schema
export interface ColumnDefinition {
    id: string
    name: string
    source: 'metadata' | 'ai_abstract' | 'ai_fulltext' | 'nlp' | 'mesh' | 'keywords'
    type: 'text' | 'number' | 'list' | 'boolean'
    domains: string[]
    ai_prompt?: string
    nlp_pattern?: string
    required?: boolean
    description?: string
}

export interface ColumnSchema {
    columns: Record<string, ColumnDefinition>
    domains: {
        id: string
        name: string
        description: string
    }[]
}

class ColumnExtractor {
    private schema: ColumnSchema | null = null
    private schemaPath = path.resolve(process.cwd(), 'shared/config/columnSchema.json')

    constructor() {
        this.loadSchema()
    }

    private loadSchema() {
        try {
            if (fs.existsSync(this.schemaPath)) {
                const data = fs.readFileSync(this.schemaPath, 'utf-8')
                this.schema = JSON.parse(data)
            } else {
                logger.warn('ColumnExtractor', 'Schema file not found', { path: this.schemaPath })
            }
        } catch (error) {
            logger.error('ColumnExtractor', 'Failed to load schema', { error })
        }
    }

    public getColumns(domain?: string): ColumnDefinition[] {
        if (!this.schema) return []

        const allColumns = Object.values(this.schema.columns)
        if (!domain || domain === 'all') return allColumns

        return allColumns.filter(col => col.domains.includes(domain))
    }

    public async extractData(article: ArticleSource, domain: string = 'all', globalSearch?: any, targetColumnIds?: string[]): Promise<Record<string, any>> {
        if (!this.schema) this.loadSchema()

        let columns = this.getColumns(domain)

        // If specific columns requested, filter by them (plus always include required metadata if needed logic exists, currently not enforcing required unless in schema)
        if (targetColumnIds && targetColumnIds.length > 0) {
            columns = columns.filter(c => targetColumnIds.includes(c.id))
        }

        const result: Record<string, any> = {}
        const aiPromises: Promise<void>[] = []

        for (const col of columns) {
            try {
                switch (col.source) {
                    case 'metadata':
                        result[col.id] = this.extractMetadata(article, col.id)
                        break
                    case 'mesh':
                        if (globalSearch && article.source === 'pubmed') {
                            const pmid = article.id.replace('pubmed-', '')
                            try {
                                result[col.id] = await globalSearch.fetchMeshTerms(pmid)
                            } catch (e) {
                                result[col.id] = []
                            }
                        } else {
                            result[col.id] = []
                        }
                        break
                    case 'ai_abstract':
                        if (article.abstract) {
                            aiPromises.push(
                                this.extractWithAI(article.abstract, col)
                                    .then(val => { result[col.id] = val })
                            )
                        }
                        break
                    case 'nlp':
                        // Simple regex extraction if pattern exists
                        if (col.nlp_pattern && article.abstract) {
                            const regex = new RegExp(col.nlp_pattern, 'i')
                            const match = article.abstract.match(regex)
                            result[col.id] = match ? match[1] || match[0] : null
                        }
                        break
                    default:
                        result[col.id] = null
                }
            } catch (e) {
                logger.warn('ColumnExtractor', `Failed to extract ${col.id}`, { error: e })
                result[col.id] = null
            }
        }

        // Wait for AI extractions
        await Promise.allSettled(aiPromises)

        return result
    }

    private extractMetadata(article: ArticleSource, field: string): any {
        switch (field) {
            case 'title': return article.title
            case 'year': return article.year
            case 'authors': return article.authors
            case 'doi': return article.doi
            case 'journal': return article.source // Approximation
            case 'abstract': return article.abstract
            default: return (article as any)[field]
        }
    }

    private async extractWithAI(text: string, col: ColumnDefinition): Promise<any> {
        if (!col.ai_prompt) return null

        try {
            const prompt = `${col.ai_prompt}\n\nContent: "${text.substring(0, 1000)}..."\n\nReturn ONLY the extracted value. If not found, return "null".`
            const response = await chatCompletion([
                { role: 'user', content: prompt }
            ], { temperature: 0.3 })

            const clean = response.content.trim().replace(/^"|"$/g, '')
            if (clean.toLowerCase() === 'null') return null

            return clean
        } catch (error) {
            return null
        }
    }
}

export const columnExtractor = new ColumnExtractor()
