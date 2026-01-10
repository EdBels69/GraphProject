import { useState, useEffect, useRef } from 'react'
import { GraphNode } from '../../shared/contracts/graph'
import { Graph } from '../../shared/contracts/graph'
import { Bot, User, Send, Sparkles, X } from 'lucide-react'

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
        { role: 'assistant', content: 'SYSTEM READY. How can I assist with graph analysis today?' }
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

    // Reset messages when graph changes
    useEffect(() => {
        setMessages([
            { role: 'assistant', content: 'SYSTEM READY. How can I assist with graph analysis today?' }
        ])
    }, [graphId])

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
            setMessages(prev => [...prev, { role: 'assistant', content: 'CONNECTION_ERROR: Analytical Core unreachable.' }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleContextualInquiry = async (node: GraphNode) => {
        const prompt = `Analyze node "${node.label}" (ID: ${node.id}). 
        What is its structural role? What key entities is it connected to?
        Provide a scientific interpretation.`

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
        <div className="flex flex-col h-full w-full bg-transparent font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-acid" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm font-display tracking-wide">AI_ANALYST</h3>
                        <p className="text-[10px] text-acid font-mono">GLM-4.7 // ONLINE</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded text-steel hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center shrink-0
                            ${msg.role === 'user' ? 'bg-white text-void' : 'bg-acid/10 text-acid border border-acid/20'}
                        `}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        <div
                            className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg backdrop-blur-sm ${msg.role === 'user'
                                ? 'bg-white text-void rounded-tr-none font-medium'
                                : 'bg-black/40 text-steel border border-white/10 rounded-tl-none'
                                }`}
                        >
                            <div className="markdown-body" style={{ whiteSpace: 'pre-wrap' }}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-acid/10 border border-acid/20 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-acid" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-acid bg-acid/5 px-3 py-2 rounded-lg border border-acid/10">
                            <Sparkles className="w-3 h-3 animate-spin" />
                            PROCESSING_QUERY...
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about graph patterns..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-steel/50 focus:outline-none focus:border-acid/50 focus:bg-white/10 transition-all font-mono"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="bg-acid text-void rounded-xl px-4 hover:bg-acid/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-glow-acid"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
