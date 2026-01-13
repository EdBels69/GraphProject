
export type AnalysisMode = 'graph' | 'edge' | 'metrics'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    mode?: AnalysisMode
    timestamp: Date
}
