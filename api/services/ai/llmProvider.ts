import dotenv from 'dotenv'
import { logger } from '../../core/Logger'

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
    private maxRetries: number
    private baseDelay: number

    constructor() {
        this.apiUrl = process.env.OPENAI_API_URL || process.env.MIMO_API_URL || 'http://localhost:9001/v1'
        this.apiKey = process.env.OPENAI_API_KEY || process.env.MIMO_API_KEY || 'dummy-key'
        // Default to GLM-4.7 as requested
        this.defaultModel = process.env.AI_MODEL || 'glm-4.7'
        this.timeout = 60000 // Increased timeout for long analyses
        this.maxRetries = 3
        this.baseDelay = 1000 // 1 second base delay
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private shouldRetry(status: number, attempt: number): boolean {
        // Retry on rate limit (429) or server errors (5xx)
        return attempt < this.maxRetries && (status === 429 || status >= 500)
    }

    async chatCompletion(messages: AIMessage[], options: AICompletionOptions = {}): Promise<AIResponse> {
        const {
            model = this.defaultModel,
            temperature = 0.7,
            maxTokens = 32000,
            stream = false
        } = options

        let lastError: Error | null = null

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
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

                    if (this.shouldRetry(response.status, attempt)) {
                        const delay = this.baseDelay * Math.pow(2, attempt) // Exponential backoff
                        logger.warn('LlmProvider', `Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms`, {
                            status: response.status,
                            error: errorData
                        })
                        await this.sleep(delay)
                        continue
                    }

                    throw new Error(`AI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
                }

                const data = await response.json()
                return {
                    content: data.choices[0]?.message?.content || '',
                    usage: data.usage
                }
            } catch (error) {
                lastError = error as Error

                // Retry on network errors (like AbortError from timeout)
                if (attempt < this.maxRetries && (error as Error).name === 'AbortError') {
                    const delay = this.baseDelay * Math.pow(2, attempt)
                    logger.warn('LlmProvider', `Timeout, retry ${attempt + 1}/${this.maxRetries}`, { error })
                    await this.sleep(delay)
                    continue
                }

                logger.error('LlmProvider', 'Chat completion failed', { error })
                throw error
            }
        }

        throw lastError || new Error('Max retries exceeded')
    }
}

export const llmProvider = new LlmProvider()
