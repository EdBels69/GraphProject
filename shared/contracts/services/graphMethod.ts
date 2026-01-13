import { Article } from '../article'
import { UniversalGraph, GraphMetrics } from '../graph'

export interface GraphMethod {
    // Identity
    id: string
    name: string
    description: string
    category: 'bibliometric' | 'content-based' | 'hybrid'

    // UI metadata
    icon: string  // lucide-react name

    // Requirements
    requiredFields: string[]  // Which Article fields are needed
    minArticles: number

    // Configuration
    configSchema: ConfigSchema

    // Core methods
    build(articles: Article[], config: any): Promise<UniversalGraph>
    validate(articles: Article[]): ValidationResult
    getMetrics(graph: UniversalGraph): GraphMetrics
}

export interface ConfigSchema {
    [key: string]: ConfigField
}

export interface ConfigField {
    type: 'number' | 'slider' | 'checkbox' | 'select' | 'multiselect'
    label: string
    description?: string
    default: any

    // Constraints
    min?: number
    max?: number
    step?: number
    options?: Array<{ value: string; label: string }>
}

export interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
    coverage: number  // % of articles with required fields
}
