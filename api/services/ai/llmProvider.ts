import dotenv from 'dotenv'
import { logger } from '../../../src/core/Logger'

dotenv.config()

export interface AIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface AIResponse {
    content: string
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

export interface AICompletionOptions {
    model?: string
    temperature?: number
    maxTokens?: number
    stream?: boolean
    jsonMode?: boolean
}

export class LlmProvider {
    private apiUrl: string
    private apiKey: string
    private defaultModel: string
    private timeout: number

    constructor() {
        this.apiUrl = process.env.OPENAI_API_URL || process.env.MIMO_API_URL || 'http://localhost:9001/v1'
        this.apiKey = process.env.OPENAI_API_KEY || process.env.MIMO_API_KEY || 'dummy-key'
        // Default to GLM-4.7 as requested
        this.defaultModel = process.env.AI_MODEL || 'glm-4.7'
        this.timeout = 60000 // Increased timeout for long analyses
    }

    async chatCompletion(messages: AIMessage[], options: AICompletionOptions = {}): Promise<AIResponse> {
        const {
            model = this.defaultModel,
            temperature = 0.7,
            maxTokens = 32000,
            stream = false
        } = options

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.timeout)

            const response = await fetch(`${this.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    stream
                }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(`AI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
            }

            const data = await response.json()
            return {
                content: data.choices[0]?.message?.content || '',
                usage: data.usage
            }
        } catch (error) {
            logger.error('LlmProvider', 'Chat completion failed', { error })
            throw error
        }
    }
}

export const llmProvider = new LlmProvider()
