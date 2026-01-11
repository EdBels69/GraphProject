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
    provider?: 'openrouter' | 'glm' | 'local' | 'openai' | 'ollama'
}

interface ProviderConfig {
    url: string
    key: string
    model: string
    status: 'online' | 'offline' | 'circuit-open'
    failureCount: number
    lastFailure?: number
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
            model: process.env.AI_MODEL || 'glm-4.7',
            status: 'online',
            failureCount: 0
        })

        // Configure GLM (ZhipuAI / Custom)
        this.providers.set('glm', {
            url: process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4',
            key: process.env.GLM_API_KEY || '',
            model: process.env.AI_MODEL || 'glm-4',
            status: 'online',
            failureCount: 0
        })

        // Configure OpenRouter
        this.providers.set('openrouter', {
            url: 'https://openrouter.ai/api/v1',
            key: process.env.OPENROUTER_API_KEY || '',
            model: process.env.AI_MODEL || 'deepseek/deepseek-chat',
            status: 'online',
            failureCount: 0
        })

        // Configure Ollama (Local)
        this.providers.set('ollama', {
            url: process.env.OLLAMA_API_URL || 'http://localhost:11434/v1',
            key: 'ollama', // Non-empty dummy key
            model: process.env.OLLAMA_MODEL || 'llama3',
            status: 'online',
            failureCount: 0
        })

        this.defaultProvider = process.env.PRIMARY_AI_PROVIDER || 'local'
        this.timeout = 60000
        this.maxRetries = 3
        this.baseDelay = 1000
    }

    public getActiveProvider(): string {
        return this.defaultProvider
    }

    private getActiveConfig(options: AICompletionOptions): { config: ProviderConfig, name: string } {
        let providerName = options.provider || this.defaultProvider
        let config = this.providers.get(providerName)

        // Circuit Breaker Check: If provider is down, find a healthy one
        if (!config || config.status === 'circuit-open') {
            logger.warn('LlmProvider', `Provider ${providerName} is in CIRCUIT-OPEN state. Searching for fallback...`)

            // Find first online provider with a key
            const healthyFallback = Array.from(this.providers.entries()).find(([name, cfg]) =>
                cfg.status === 'online' && (cfg.key || name === 'local')
            )

            if (!healthyFallback) {
                const error = `All AI providers are currently unavailable or in CIRCUIT-OPEN state.`
                logger.error('LlmProvider', error)
                throw new Error(error)
            }

            providerName = healthyFallback[0]
            config = healthyFallback[1]
            logger.info('LlmProvider', `Selected fallback provider: ${providerName}`)
        }

        return {
            name: providerName,
            config: {
                ...config,
                model: options.model || config.model
            }
        }
    }

    private handleFailure(providerName: string, error?: any) {
        const config = this.providers.get(providerName)
        if (!config) return

        config.failureCount++
        config.lastFailure = Date.now()

        // Connection refused or other hard errors should trigger circuit breaker faster
        const isHardError = error?.code === 'ECONNREFUSED' || error?.name === 'AbortError';

        if (config.failureCount >= 3 || isHardError) {
            config.status = 'circuit-open'
            const reason = isHardError ? `Hard error (${error.code || error.name})` : `Too many failures (${config.failureCount})`;
            logger.error('LlmProvider', `CIRCUIT OPEN for ${providerName}. Reason: ${reason}`)

            // Auto-reset circuit after 10 minutes (increased from 5)
            setTimeout(() => {
                config.status = 'online'
                config.failureCount = 0
                logger.info('LlmProvider', `CIRCUIT CLOSED for ${providerName}. Retrying availability...`)
            }, 600000)
        }
    }

    private handleSuccess(providerName: string) {
        const config = this.providers.get(providerName)
        if (config) {
            config.failureCount = 0
            config.status = 'online'
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    private shouldRetry(status: number, attempt: number): boolean {
        return attempt < this.maxRetries && (status === 429 || status >= 500)
    }

    async chatCompletion(messages: AIMessage[], options: AICompletionOptions = {}): Promise<AIResponse> {
        let { name: providerName, config } = this.getActiveConfig(options)
        const {
            temperature = 0.7,
            maxTokens = 32000,
            stream = false
        } = options

        let lastError: Error | null = null

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            // Skip if no API key for non-local provider
            if (providerName !== 'local' && !config.key) {
                logger.warn('LlmProvider', `Provider ${providerName} selected but no API key present. Falling back to local.`);
                return this.chatCompletion(messages, { ...options, provider: 'local' });
            }

            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), this.timeout)

                const response = await fetch(`${config.url}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.key}`,
                        'HTTP-Referer': 'https://github.com/EdBels69/GraphProject',
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
                            provider: providerName
                        })
                        await this.sleep(delay)
                        continue
                    }

                    this.handleFailure(providerName)
                    const errorMsg = `AI API error: ${response.status} ${response.statusText} - ${providerName}`;
                    logger.error('LlmProvider', errorMsg);
                    throw new Error(errorMsg)
                }

                const data = await response.json()
                this.handleSuccess(providerName)
                return {
                    content: data.choices[0]?.message?.content || '',
                    usage: data.usage
                }
            } catch (error) {
                lastError = error as Error

                if (attempt < this.maxRetries && ((error as any).name === 'AbortError' || (error as any).code === 'ECONNREFUSED')) {
                    const delay = this.baseDelay * Math.pow(2, attempt)
                    logger.warn('LlmProvider', `Retryable error on ${providerName}, attempt ${attempt + 1}`, { error })
                    await this.sleep(delay)
                    continue
                }

                this.handleFailure(providerName, error)
                const cause = (error as any).cause || (error as any).code || 'Unknown';
                const finalErrorMsg = `Chat completion failed for ${providerName}: ${(error as Error).message}`;

                logger.error('LlmProvider', 'Chat completion failed', {
                    error: (error as Error).message,
                    provider: providerName,
                    url: config.url
                })

                // If this provider failed and we have retries/alternatives, try one more time with a DIFFERENT provider if it wasn't local
                if (providerName !== 'local' && attempt < this.maxRetries) {
                    logger.info('LlmProvider', `Attempting final fallback after ${providerName} failure`)
                    return this.chatCompletion(messages, { ...options, provider: undefined }) // Let getActiveConfig pick next
                }

                throw new Error(finalErrorMsg)
            }
        }

        throw lastError || new Error('Max retries exceeded')
    }
}

export const llmProvider = new LlmProvider()
