import { useState, useEffect, useRef } from 'react'
import { GraphNode, Graph } from '@/shared/types'

interface GraphAssistantProps {
    selectedNode: GraphNode | null
    graphId: string
    graph: Graph
    onClose: () => void
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function GraphAssistant({ selectedNode, graphId, graph, onClose }: GraphAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Привет! Я Senior Analyst на базе GLM-4.7. Я готов проанализировать структуру этого графа, найти скрытые связи или объяснить роль любого узла.' }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Contextual Trigger: When a node is selected, auto-prompt the AI
    useEffect(() => {
        if (selectedNode) {
            handleContextualInquiry(selectedNode)
        }
    }, [selectedNode])

    const callAiApi = async (question: string) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/ai/ask-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    graphContext: {
                        nodes: graph.nodes.map(n => ({ id: n.id, label: n.label, type: n.data?.type })),
                        edges: graph.edges.slice(0, 5000).map(e => ({ source: e.source, target: e.target })), // GLM-4.7 context (200k) allows full graph
                        communities: 0
                    }
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to fetch AI response')

            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
        } catch (error) {
            console.error('AI Error:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: 'Извините, произошла ошибка при обращении к аналитическому ядру. Попробуйте еще раз.' }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleContextualInquiry = async (node: GraphNode) => {
        const prompt = `Проанализируй узел "${node.label}" (ID: ${node.id}). 
        Какова его роль в структуре? С какими ключевыми сущностями он связан?
        Дай научную интерпретацию.`

        const userMsg: Message = { role: 'user', content: prompt }
        setMessages(prev => [...prev, userMsg])

        await callAiApi(prompt)
    }

    const handleSendMessage = async () => {
        if (!input.trim()) return

        const userMsg: Message = { role: 'user', content: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')

        await callAiApi(input)
    }

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full transform transition-transform">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl">🧬</span>
                    <h3 className="font-semibold text-gray-800">Senior Analyst (GLM-4.7)</h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[90%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}
                        >
                            <div className="markdown-body" style={{ whiteSpace: 'pre-wrap' }}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                            <div className="flex space-x-1">
                                <span className="text-xs text-gray-400 animate-pulse">Анализирую граф...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Задайте вопрос по графу..."
                        className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    )
}
