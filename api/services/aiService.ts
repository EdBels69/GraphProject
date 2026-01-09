import { AI_PROMPTS } from './ai/prompts'
import { llmProvider } from './ai/llmProvider'
import type { AIMessage, AIResponse, AICompletionOptions } from './ai/llmProvider'
import { logger } from '../../src/core/Logger'

// Re-export types for backward compatibility
export { AIMessage, AIResponse, AICompletionOptions }

export interface ExtractedEntity {
    name: string
    type: string
    description?: string
    confidence?: number
    mentions?: number
    source?: string
}

export interface DocumentSummary {
    summary: string
    keyFindings: string[]
    entities: ExtractedEntity[]
    keywords: string[]
}

// 1. Core Chat Facade
export async function chatCompletion(
    messages: AIMessage[],
    options: AICompletionOptions = {}
): Promise<AIResponse> {
    return llmProvider.chatCompletion(messages, options)
}

// 2. Entity Extraction Facade
export async function extractEntitiesWithAI(text: string): Promise<ExtractedEntity[]> {
    const chunk = text.slice(0, 150000) // 150k limit for GLM-4.7

    try {
        const response = await chatCompletion([
            { role: 'system', content: AI_PROMPTS.ENTITY_EXTRACTION.SYSTEM },
            { role: 'user', content: `Extract biomedical entities from this text:\n\n${chunk}` }
        ], { temperature: 0.3 })

        const cleaned = response.content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        const entities = Array.isArray(parsed) ? parsed : []

        // Validate and filter extracted entities
        return validateExtractedEntities(entities)
    } catch (error) {
        logger.error('aiService', 'Entity extraction failed', { error })
        return []
    }
}

// 2.1 Entity Validation (Phase 14.1)
const VALID_ENTITY_TYPES = ['Gene', 'Protein', 'Disease', 'Drug', 'Pathway', 'Metabolite', 'Anatomy', 'Symptom', 'Concept']
const MIN_ENTITY_NAME_LENGTH = 2
const MIN_CONFIDENCE_THRESHOLD = 0.5

export function validateExtractedEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
    return entities.filter(entity => {
        // Check required fields exist
        if (!entity.name || typeof entity.name !== 'string') return false
        if (!entity.type || typeof entity.type !== 'string') return false

        // Check name length
        if (entity.name.trim().length < MIN_ENTITY_NAME_LENGTH) return false

        // Filter out common noise words
        const noiseWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'this', 'that', 'these', 'study', 'method', 'results', 'figure', 'table']
        if (noiseWords.includes(entity.name.toLowerCase())) return false

        // Check confidence threshold
        const confidence = entity.confidence ?? 0.8
        if (confidence < MIN_CONFIDENCE_THRESHOLD) return false

        // Normalize entity type
        entity.type = normalizeEntityType(entity.type)

        return true
    }).map(entity => ({
        ...entity,
        confidence: entity.confidence ?? 0.8,
        mentions: entity.mentions ?? 1
    }))
}

function normalizeEntityType(type: string): string {
    const normalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()

    // Map common variants to standard types
    const typeMap: Record<string, string> = {
        'gene': 'Gene',
        'protein': 'Protein',
        'chemical': 'Drug',
        'compound': 'Drug',
        'medication': 'Drug',
        'disease': 'Disease',
        'disorder': 'Disease',
        'condition': 'Disease',
        'pathway': 'Pathway',
        'process': 'Pathway',
        'metabolism': 'Pathway',
        'metabolite': 'Metabolite',
        'tissue': 'Anatomy',
        'organ': 'Anatomy',
        'cell': 'Anatomy',
        'symptom': 'Symptom',
        'concept': 'Concept'
    }

    const lowerType = type.toLowerCase()
    return typeMap[lowerType] || (VALID_ENTITY_TYPES.includes(normalized) ? normalized : 'Concept')
}

// 3. Summarization Facade
export async function summarizeDocument(text: string, title?: string): Promise<DocumentSummary> {
    const chunk = text.slice(0, 150000)

    try {
        const response = await chatCompletion([
            { role: 'system', content: AI_PROMPTS.SUMMARIZATION.SYSTEM },
            { role: 'user', content: `${title ? `Title: ${title}\n\n` : ''}Document text:\n\n${chunk}` }
        ], { temperature: 0.5, maxTokens: 4096 })

        const cleaned = response.content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
        const result = JSON.parse(cleaned)

        // Ensure fallback structure
        return {
            summary: result.summary || 'Summary generation failed.',
            keyFindings: Array.isArray(result.keyFindings) ? result.keyFindings : [],
            entities: Array.isArray(result.entities) ? result.entities : [],
            keywords: Array.isArray(result.keywords) ? result.keywords : []
        }
    } catch (error) {
        logger.error('aiService', 'Summarization failed', { error })
        return {
            summary: 'Failed to generate summary due to an error.',
            keyFindings: [],
            entities: [],
            keywords: []
        }
    }
}

// 4. Graph Interpretation Facade
export async function askAboutGraph(
    question: string,
    graphContext: {
        nodes: Array<{ id: string; label: string; type?: string }>
        edges: Array<{ source: string; target: string; type?: string }>
        topNodes?: Array<{ label: string; pagerank: number }>
        communities?: number
    }
): Promise<string> {
    const nodeCount = graphContext.nodes.length
    const edgeCount = graphContext.edges.length
    const communityCount = graphContext.communities
    const topNodes = graphContext.topNodes?.slice(0, 5).map((n, i) => `${i + 1}. ${n.label}`).join('\n')
    const context = graphContext.nodes.slice(0, 50).map(n => n.label).join(', ')

    const systemPrompt = AI_PROMPTS.GRAPH_INTERPRETATION.SYSTEM(nodeCount, edgeCount, communityCount, topNodes, context)

    try {
        const response = await chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
        ], { temperature: 0.7 })

        return response.content
    } catch (error) {
        logger.error('aiService', 'Graph Q&A failed', { error })
        return "I apologize, but I encountered an error analyzing the graph structure available."
    }
}

// 5. Research Recommendations Facade
export async function generateResearchRecommendations(
    gaps: {
        sparseAreas: Array<{ nodes: string[]; density: number }>
        isolatedNodes: string[]
        bridgeOpportunities: Array<{ community1: number; community2: number }>
    },
    nodeLabels: Map<string, string>
): Promise<string[]> {
    const gapDesc = `
    Sparse Connected Areas: ${gaps.sparseAreas.length}
    Isolated Nodes: ${gaps.isolatedNodes.length} (${gaps.isolatedNodes.slice(0, 5).join(', ')}...)
    Bridge Opportunities: ${gaps.bridgeOpportunities.length}
    `

    try {
        const response = await chatCompletion([
            { role: 'system', content: AI_PROMPTS.RESEARCH_RECOMMENDATIONS.SYSTEM },
            { role: 'user', content: `Analyze these structural gaps and propose research directions:\n${gapDesc}` }
        ], { temperature: 0.8 })

        // Split paragraphs
        return response.content.split('\n\n').filter(p => p.length > 20)
    } catch (error) {
        logger.error('aiService', 'Recommendation generation failed', { error })
        return []
    }
}

// 6. Health Check
export async function checkAIHealth(): Promise<{ available: boolean; model?: string; error?: string }> {
    try {
        const response = await chatCompletion([
            { role: 'user', content: 'Hi' }
        ], { maxTokens: 5 })
        return { available: true, model: process.env.AI_MODEL || 'glm-4.7' }
    } catch (error) {
        return { available: false, error: String(error) }
    }
}

// 7. Streaming Chat (placeholder - not fully implemented)
export async function chatCompletionStream(
    messages: AIMessage[],
    options: AICompletionOptions,
    onChunk: (chunk: string) => void
): Promise<void> {
    // For now, just get the full response and emit it as one chunk
    // Real streaming would require SSE support in llmProvider
    const response = await chatCompletion(messages, options)
    onChunk(response.content)
}
