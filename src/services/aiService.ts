export interface AIStatus {
    available: boolean
    model?: string
    error?: string
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

export interface ChatResponse {
    content: string
    model?: string
}

export class AIService {
    private static instance: AIService

    private constructor() { }

    static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService()
        }
        return AIService.instance
    }

    async checkStatus(): Promise<AIStatus> {
        try {
            const response = await fetch('/api/ai/health')
            if (!response.ok) {
                throw new Error('Health check failed')
            }
            return await response.json()
        } catch (error) {
            console.error('AI check status error:', error)
            return { available: false, error: 'Не удалось проверить статус AI' }
        }
    }

    async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
        try {
            // Filter out system messages from history if passed directly, 
            // but usually we want to control the system prompt here or in the caller.
            // For now, let's assume the caller constructs the full payload including system prompt.

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages })
            })

            if (!response.ok) {
                throw new Error('AI request failed')
            }

            return await response.json()
        } catch (error) {
            console.error('AI send message error:', error)
            throw error
        }
    }
}

export const aiService = AIService.getInstance()
