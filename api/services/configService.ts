
import { databaseManager } from '../../src/core/Database'
import { logger } from '../../src/core/Logger'

export interface OntologyType {
    id: string
    name: string
    color: string
    icon?: string
    description?: string
}

export interface OntologyRelation {
    id: string
    sourceType: string
    targetType: string
    label: string
    inverse?: string
}

export interface OntologyConfig {
    nodeTypes: OntologyType[]
    relationTypes: OntologyRelation[]
}

export interface PromptConfig {
    id: string
    name: string
    description?: string
    template: string
    variables: string[] // e.g. ["content", "topic"]
}

const DEFAULT_ONTOLOGY: OntologyConfig = {
    nodeTypes: [
        { id: 'protein', name: 'Protein', color: '#3b82f6', icon: 'dna' }, // blue-500
        { id: 'gene', name: 'Gene', color: '#6366f1', icon: 'dna' }, // indigo-500
        { id: 'chemical', name: 'Chemical', color: '#10b981', icon: 'flask' }, // emerald-500
        { id: 'disease', name: 'Disease', color: '#ef4444', icon: 'activity' }, // red-500
        { id: 'pathway', name: 'Pathway', color: '#8b5cf6', icon: 'git-branch' }, // violet-500
        { id: 'cell_type', name: 'Cell Type', color: '#f59e0b', icon: 'box' }, // amber-500
        { id: 'tissue', name: 'Tissue', color: '#ec4899', icon: 'layers' }, // pink-500
        { id: 'biological_process', name: 'Process', color: '#06b6d4', icon: 'settings' }, // cyan-500
        { id: 'concept', name: 'General Concept', color: '#94a3b8', icon: 'circle' } // slate-400
    ],
    relationTypes: [
        { id: 'interacts_with', sourceType: 'protein', targetType: 'protein', label: 'Interacts with' },
        { id: 'regulates', sourceType: 'protein', targetType: 'gene', label: 'Regulates' },
        { id: 'associated_with', sourceType: 'any', targetType: 'any', label: 'Associated with' }
    ]
}

const DEFAULT_PROMPTS: Record<string, PromptConfig> = {
    'entity_extraction': {
        id: 'entity_extraction',
        name: 'Entity Extraction',
        description: 'Extracts entities and relations from text',
        variables: ['content', 'ontology'],
        template: `You are an expert biomedical analyst. Extract structured knowledge from the text.
Use the following Ontology for types: {{ontology}}

Text:
"{{content}}"

Return JSON with "entities" and "relations".`
    },
    'summarization': {
        id: 'summarization',
        name: 'Summarization',
        description: 'Summarizes scientific text',
        variables: ['content', 'topic'],
        template: `Summarize the following text focusing on {{topic}}:
"{{content}}"
`
    }
}

class ConfigService {
    private cache: Map<string, any> = new Map()

    async getOntology(): Promise<OntologyConfig> {
        return this.getConfig('ontology', DEFAULT_ONTOLOGY)
    }

    async saveOntology(config: OntologyConfig): Promise<void> {
        await this.saveConfig('ontology', config)
    }

    async getPrompts(): Promise<Record<string, PromptConfig>> {
        return this.getConfig('prompts', DEFAULT_PROMPTS)
    }

    async savePrompts(config: Record<string, PromptConfig>): Promise<void> {
        await this.saveConfig('prompts', config)
    }

    private async getConfig<T>(key: string, defaultValue: T): Promise<T> {
        // Check cache first
        if (this.cache.has(key)) {
            return this.cache.get(key)
        }

        try {
            // @ts-ignore - Prisma client type not updated in IDE but exists in runtime
            const prisma = databaseManager.getClient()
            if (!prisma.systemConfig) return defaultValue // Handle migration case

            // @ts-ignore
            const record = await prisma.systemConfig.findUnique({ where: { key } })

            if (record) {
                try {
                    const value = JSON.parse(record.value)
                    this.cache.set(key, value)
                    return value
                } catch (e) {
                    logger.error('ConfigService', `Failed to parse config for ${key}`, { error: e })
                    return defaultValue
                }
            }
        } catch (e) {
            // Table might not exist yet if migration pending
            logger.warn('ConfigService', `Failed to fetch config for ${key}`, { error: e })
        }

        return defaultValue
    }

    private async saveConfig<T>(key: string, value: T): Promise<void> {
        const prisma = databaseManager.getClient()
        const json = JSON.stringify(value)

        // @ts-ignore
        await prisma.systemConfig.upsert({
            where: { key },
            update: { value: json },
            create: { key, value: json }
        })

        this.cache.set(key, value)
    }
}

export const configService = new ConfigService()
