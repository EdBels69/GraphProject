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
    provider?: 'openrouter' | 'glm' | 'local' | 'openai'
}

interface ProviderConfig {
    url: string
    key: string
    model: string
}

export class LlmProvider {
    private providers: Map<string, ProviderConfig>
    private defaultProvider: string
    private timeout: number
    private maxRetries: number
    private baseDelay: number

    constructor() {
        this.providers = new Map()

        // Configure Local / Mimo (Default fallback)
        this.providers.set('local', {
            url: process.env.MIMO_API_URL || 'http://localhost:9001/v1',
            key: process.env.MIMO_API_KEY || 'dummy-key',
            model: process.env.AI_MODEL || 'glm-4.7'
        })

        // Configure GLM (ZhipuAI / Custom)
        this.providers.set('glm', {
            url: process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4',
            key: process.env.GLM_API_KEY || '',
            model: process.env.AI_MODEL || 'glm-4'
        })

        // Configure OpenRouter
        this.providers.set('openrouter', {
            url: 'https://openrouter.ai/api/v1',
            key: process.env.OPENROUTER_API_KEY || '',
            model: process.env.AI_MODEL || 'deepseek/deepseek-chat'
        })

        this.defaultProvider = process.env.PRIMARY_AI_PROVIDER || 'local'
        this.timeout = 60000
        this.maxRetries = 3
        this.baseDelay = 1000
    }

    public getActiveProvider(): string {
        return this.defaultProvider
    }

    private getActiveConfig(options: AICompletionOptions): ProviderConfig {
        const providerName = options.provider || this.defaultProvider
        const config = this.providers.get(providerName) || this.providers.get('local')!

        return {
            url: config.url,
            key: config.key,
            model: options.model || config.model
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private shouldRetry(status: number, attempt: number): boolean {
        return attempt < this.maxRetries && (status === 429 || status >= 500)
    }

    async chatCompletion(messages: AIMessage[], options: AICompletionOptions = {}): Promise<AIResponse> {
        const config = this.getActiveConfig(options)
        const {
            temperature = 0.7,
            maxTokens = 32000,
            stream = false
        } = options

        let lastError: Error | null = null

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            // Skip if no API key for non-local provider
            if (options.provider !== 'local' && !config.key) {
                logger.warn('LlmProvider', `Provider ${options.provider} selected but no API key present. Falling back to local.`);
                // Recursively call with local if possible, or just fail
                if (options.provider !== 'local') {
                    return this.chatCompletion(messages, { ...options, provider: 'local' });
                }
            }

            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), this.timeout)

                const response = await fetch(`${config.url}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.key}`,
                        'HTTP-Referer': 'https://github.com/EdBels69/GraphProject', // OpenRouter requirement
                        'X-Title': 'Graph Analyser'
                    },
                    body: JSON.stringify({
                        model: config.model,
                        messages,
                        temperature,
                        max_tokens: maxTokens,
                        stream
                    }),
                    signal: controller.signal
                })

                clearTimeout(timeoutId)

                if (!response.ok) {
                    let errorData: any = {};
                    try {
                        errorData = await response.json();
                    } catch (e) {
                        try {
                            errorData = { text: await response.text() };
                        } catch (e2) {
                            errorData = { message: 'Failed to parse error response' };
                        }
                    }

                    if (this.shouldRetry(response.status, attempt)) {
                        const delay = this.baseDelay * Math.pow(2, attempt)
                        logger.warn('LlmProvider', `Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms`, {
                            status: response.status,
                            error: errorData
                        })
                        await this.sleep(delay)
                        continue
                    }

                    const errorMsg = `AI API error: ${response.status} ${response.statusText} - ${typeof errorData === 'object' ? JSON.stringify(errorData) : errorData}`;
                    logger.error('LlmProvider', errorMsg);
                    throw new Error(errorMsg)
                }

                const data = await response.json()
                return {
                    content: data.choices[0]?.message?.content || '',
                    usage: data.usage
                }
            } catch (error) {
                lastError = error as Error

                if (attempt < this.maxRetries && ((error as any).name === 'AbortError' || (error as any).code === 'ECONNREFUSED')) {
                    const delay = this.baseDelay * Math.pow(2, attempt)
                    const reason = (error as any).name === 'AbortError' ? 'Timeout' : 'Connection refused';
                    logger.warn('LlmProvider', `${reason}, retry ${attempt + 1}/${this.maxRetries}`, { error })
                    await this.sleep(delay)
                    continue
                }

                const cause = (error as any).cause || (error as any).code || 'Unknown';
                const finalErrorMsg = `Chat completion failed for ${config.url}: ${(error as Error).message} (Cause: ${cause})`;

                logger.error('LlmProvider', 'Chat completion failed', {
                    error: (error as Error).message,
                    cause: cause,
                    url: config.url
                })
                throw new Error(finalErrorMsg)
            }
        }

        throw lastError || new Error('Max retries exceeded')
    }
}

export const llmProvider = new LlmProvider()
