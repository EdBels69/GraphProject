/**
 * AI Service
 * 
 * Universal interface for LLM APIs (OpenAI-compatible, MiMo, etc.)
 * Supports entity extraction, summarization, and chat
 */

import { logger } from '../../src/core/Logger'
import { isFeatureEnabled } from '../../shared/config/features'

// Types
export interface AIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface AICompletionOptions {
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
}

export interface AIResponse {
    content: string
    model: string
    usage?: {
        promptTokens: number
        completionTokens: number
        totalTokens: number
    }
}

export interface ExtractedEntity {
    name: string
    type: string
    confidence: number
    context?: string
}

export interface DocumentSummary {
    title?: string
    summary: string
    keyFindings: string[]
    entities: ExtractedEntity[]
    keywords: string[]
}

// Configuration - lazy loaded to ensure dotenv is loaded first
function getConfig() {
    return {
        apiUrl: process.env.OPENAI_API_URL || process.env.MIMO_API_URL || 'http://localhost:9001/v1',
        apiKey: process.env.OPENAI_API_KEY || process.env.MIMO_API_KEY || 'dummy-key',
        defaultModel: process.env.AI_MODEL || 'deepseek/deepseek-chat',
        timeout: 30000
    }
}

/**
 * Send a chat completion request
 */
export async function chatCompletion(
    messages: AIMessage[],
    options: AICompletionOptions = {}
): Promise<AIResponse> {
    const config = getConfig()
    const {
        model = config.defaultModel,
        temperature = 0.7,
        maxTokens = 2048,
        stream = false
    } = options

    if (!isFeatureEnabled('USE_AI_FEATURES')) {
        throw new Error('AI features are disabled')
    }

    try {
        const response = await fetch(`${config.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': 'http://localhost:3000', // Required for OpenRouter
                'X-Title': 'Graph Analyser' // Optional for OpenRouter
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
                stream
            }),
            signal: AbortSignal.timeout(config.timeout)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`AI API error: ${response.status} - ${error}`)
        }

        const data = await response.json()

        return {
            content: data.choices?.[0]?.message?.content || '',
            model: data.model || model,
            usage: data.usage ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            } : undefined
        }
    } catch (error) {
        logger.error('AIService', 'Chat completion failed', { error })
        throw error
    }
}

/**
 * Clean JSON string from markdown code blocks
 */
function cleanJson(text: string): string {
    // Remove markdown code blocks if present
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (markdownMatch) {
        return markdownMatch[1].trim()
    }
    return text.trim()
}

/**
 * Extract biomedical entities from text using AI
 */
export async function extractEntitiesWithAI(text: string): Promise<ExtractedEntity[]> {
    const systemPrompt = `You are a biomedical NLP expert. Extract entities from the given text.
For each entity, identify:
- name: the exact term from the text
- type: one of [protein, gene, disease, drug, pathway, metabolite, organism, cell_type, tissue]
- confidence: 0.0-1.0 based on certainty

Return ONLY valid JSON array. Do not include any explanation or markdown formatting.
Example: [{"name": "p53", "type": "protein", "confidence": 0.95}]`

    try {
        const response = await chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Extract biomedical entities from this text:\n\n${text.slice(0, 3000)}` }
        ], { temperature: 0.3 })

        try {
            const cleaned = cleanJson(response.content)
            const parsed = JSON.parse(cleaned)
            return Array.isArray(parsed) ? parsed : []
        } catch (e) {
            // Second try with strictly JSON prompt if parse failed
            logger.warn('AIService', 'First JSON parse failed, retrying with strict prompt')
            const retryResponse = await chatCompletion([
                { role: 'system', content: systemPrompt + "\nIMPORTANT: You failed to provide valid JSON in the previous turn. Return ONLY raw JSON array now." },
                { role: 'user', content: `Extract biomedical entities from this text:\n\n${text.slice(0, 3000)}` }
            ], { temperature: 0.1 })

            const cleanedRetry = cleanJson(retryResponse.content)
            return JSON.parse(cleanedRetry)
        }
    } catch (error) {
        logger.warn('AIService', 'Entity extraction failed', { error })
        return []
    }
}

/**
 * Generate a summary of a document
 */
export async function summarizeDocument(text: string, title?: string): Promise<DocumentSummary> {
    const systemPrompt = `You are a scientific document analyzer. Summarize the given text.
Return a JSON object with:
- summary: 2-3 paragraph summary
- keyFindings: array of 3-5 main findings
- entities: array of key biomedical entities (name, type, confidence)
- keywords: array of 5-10 keywords

Return ONLY valid JSON, no explanation.`

    try {
        const response = await chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${title ? `Title: ${title}\n\n` : ''}Document text:\n\n${text.slice(0, 6000)}` }
        ], { temperature: 0.5, maxTokens: 4096 })

        let parsed: any
        try {
            const cleaned = cleanJson(response.content)
            parsed = JSON.parse(cleaned)
        } catch (e) {
            // Retry logic
            logger.warn('AIService', 'Summarization JSON parse failed, retrying')
            const retryResponse = await chatCompletion([
                { role: 'system', content: systemPrompt + "\nIMPORTANT: You failed to provide valid JSON in the previous turn. Return ONLY raw JSON object now." },
                { role: 'user', content: `${title ? `Title: ${title}\n\n` : ''}Document text:\n\n${text.slice(0, 6000)}` }
            ], { temperature: 0.2 })
            parsed = JSON.parse(cleanJson(retryResponse.content))
        }

        return {
            title,
            summary: parsed.summary || '',
            keyFindings: parsed.keyFindings || parsed.key_findings || [],
            entities: parsed.entities || [],
            keywords: parsed.keywords || []
        }
    } catch (error) {
        logger.warn('AIService', 'Document summarization failed', { error })
        return {
            title,
            summary: 'Summarization failed. Please try again.',
            keyFindings: [],
            entities: [],
            keywords: []
        }
    }
}

/**
 * Answer a question about graph relationships
 */
export async function askAboutGraph(
    question: string,
    graphContext: {
        nodes: Array<{ id: string; label: string; type?: string }>
        edges: Array<{ source: string; target: string; type?: string }>
        topNodes?: Array<{ label: string; pagerank: number }>
        communities?: number
    }
): Promise<string> {
    const systemPrompt = `You are a biomedical research assistant specializing in knowledge graphs.
You have access to a graph with the following structure:
- ${graphContext.nodes.length} nodes (entities)
- ${graphContext.edges.length} edges (relationships)
${graphContext.communities ? `- ${graphContext.communities} detected communities` : ''}

Top entities by importance:
${graphContext.topNodes?.slice(0, 5).map((n, i) => `${i + 1}. ${n.label}`).join('\n') || 'N/A'}

Sample nodes: ${graphContext.nodes.slice(0, 10).map(n => n.label).join(', ')}

Answer questions about this graph concisely. If you don't know, say so.`

    try {
        const response = await chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
        ], { temperature: 0.7 })

        return response.content
    } catch (error) {
        logger.warn('AIService', 'Graph question failed', { error })
        return 'Sorry, I could not process your question. Please try again.'
    }
}

/**
 * Generate research recommendations based on gaps
 */
export async function generateResearchRecommendations(
    gaps: {
        sparseAreas: Array<{ nodes: string[]; density: number }>
        isolatedNodes: string[]
        bridgeOpportunities: Array<{ community1: number; community2: number }>
    },
    nodeLabels: Map<string, string>
): Promise<string[]> {
    const systemPrompt = `You are a research advisor. Based on graph analysis results, suggest specific research directions.
Be specific and actionable. Each recommendation should be 1-2 sentences.`

    const gapsDescription = [
        gaps.sparseAreas.length > 0 ?
            `Sparse research areas: ${gaps.sparseAreas.map(a =>
                a.nodes.slice(0, 3).map(id => nodeLabels.get(id) || id).join(', ')
            ).join('; ')}` : '',
        gaps.isolatedNodes.length > 0 ?
            `Under-studied entities: ${gaps.isolatedNodes.slice(0, 5).map(id => nodeLabels.get(id) || id).join(', ')}` : '',
        gaps.bridgeOpportunities.length > 0 ?
            `Potential cross-domain connections: ${gaps.bridgeOpportunities.length} opportunities identified` : ''
    ].filter(Boolean).join('\n')

    try {
        const response = await chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Based on this gap analysis, suggest 3-5 research directions:\n\n${gapsDescription}` }
        ], { temperature: 0.8 })

        // Split into lines and filter
        const lines = response.content.split('\n')
            .map(l => l.replace(/^\d+\.\s*/, '').trim())
            .filter(l => l.length > 20)
            .slice(0, 5)

        return lines.length > 0 ? lines : ['No specific recommendations could be generated.']
    } catch (error) {
        logger.warn('AIService', 'Recommendations generation failed', { error })
        return ['AI recommendations unavailable. Please check AI service configuration.']
    }
}

/**
 * Check if AI service is available
 */
export async function checkAIHealth(): Promise<{ available: boolean; model?: string; error?: string }> {
    if (!isFeatureEnabled('USE_AI_FEATURES')) {
        return { available: false, error: 'AI features are disabled in configuration' }
    }

    try {
        const config = getConfig()
        const response = await fetch(`${config.apiUrl}/models`, {
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Graph Analyser'
            },
            signal: AbortSignal.timeout(5000)
        })

        if (response.ok) {
            const data = await response.json()
            return {
                available: true,
                model: data.data?.[0]?.id || config.defaultModel
            }
        }

        return { available: false, error: `API returned ${response.status}` }
    } catch (error) {
        return { available: false, error: String(error) }
    }
}
