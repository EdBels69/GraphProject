import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Graph } from '../../shared/types'

type AnalysisMode = 'graph' | 'edge' | 'metrics'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    mode?: AnalysisMode
    timestamp: Date
}

export default function AIAnalysisPage() {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [mode, setMode] = useState<AnalysisMode>('graph')
    const [graph, setGraph] = useState<Graph | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const preselectedNode = searchParams.get('node')

    useEffect(() => {
        fetchGraph()
    }, [id])

    useEffect(() => {
        if (preselectedNode && graph) {
            const node = graph.nodes.find(n => n.id === preselectedNode)
            if (node) {
                setMode('edge')
                setInputValue(`Расскажи о "${node.label}" и его связях в графе`)
            }
        }
    }, [preselectedNode, graph])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchGraph = async () => {
        try {
            const response = await fetch(`/api/research/jobs/${id}`)
            if (response.ok) {
                const data = await response.json()
                if (data.job?.graphId) {
                    const graphResponse = await fetch(`/api/graphs/${data.job.graphId}`)
                    if (graphResponse.ok) {
                        const graphData = await graphResponse.json()
                        setGraph(graphData.graph)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch graph:', error)
        }
    }

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            mode,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            const graphContext = graph ? {
                nodes: graph.nodes.slice(0, 200).map(n => ({
                    id: n.id,
                    label: n.label,
                    type: n.type
                })),
                edges: graph.edges.slice(0, 500).map(e => ({
                    source: e.source,
                    target: e.target,
                    relation: e.relation
                })),
                nodeCount: graph.nodes.length,
                edgeCount: graph.edges.length
            } : null

            const response = await fetch('/api/ai/ask-graph', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: inputValue,
                    graphContext,
                    analysisMode: mode
                })
            })

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer || 'Не удалось получить ответ',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('Failed to send message:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Ошибка при обращении к AI. Попробуйте позже.',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const modeConfig = {
        graph: {
            emoji: '🕸️',
            label: 'По графу',
            description: 'Анализ всей структуры графа',
            prompts: ['Опиши структуру графа', 'Какие основные кластеры?', 'Найди ключевые узлы']
        },
        edge: {
            emoji: '🔗',
            label: 'По связям',
            description: 'Объяснение конкретных связей',
            prompts: ['Почему эти узлы связаны?', 'Какой тип связи между X и Y?', 'Найди путь между A и B']
        },
        metrics: {
            emoji: '📈',
            label: 'По метрикам',
            description: 'Интерпретация централизации и кластеров',
            prompts: ['Какой узел самый важный?', 'Объясни PageRank', 'Сколько сообществ в графе?']
        }
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            {/* Header */}
            <header style={{
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        onClick={() => navigate(`/research/${id}/graph`)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14 }}
                    >
                        ← К графу
                    </button>
                    <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        🤖 AI Анализ
                    </h1>
                </div>
                <button
                    onClick={() => navigate(`/research/${id}/report`)}
                    style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                >
                    📝 Отчёт →
                </button>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar - Mode Selection */}
                <aside style={{
                    width: 280,
                    background: '#fff',
                    borderRight: '1px solid #e2e8f0',
                    padding: 20,
                    flexShrink: 0,
                    overflowY: 'auto'
                }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 16 }}>Режим анализа</h3>

                    {(Object.keys(modeConfig) as AnalysisMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                padding: '14px 16px',
                                marginBottom: 8,
                                borderRadius: 12,
                                border: mode === m ? '2px solid #8b5cf6' : '2px solid transparent',
                                background: mode === m ? '#f5f3ff' : '#f8fafc',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}
                        >
                            <span style={{ fontSize: 24 }}>{modeConfig[m].emoji}</span>
                            <div>
                                <div style={{ fontWeight: 600, color: mode === m ? '#5b21b6' : '#1e293b', fontSize: 14 }}>
                                    {modeConfig[m].label}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                    {modeConfig[m].description}
                                </div>
                            </div>
                        </button>
                    ))}

                    <div style={{ marginTop: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Примеры запросов</h4>
                        {modeConfig[mode].prompts.map((prompt, i) => (
                            <button
                                key={i}
                                onClick={() => setInputValue(prompt)}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '10px 12px',
                                    marginBottom: 6,
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    fontSize: 13,
                                    color: '#475569',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    {graph && (
                        <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                            <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>📊 Контекст</h4>
                            <div style={{ fontSize: 13, color: '#475569' }}>
                                {graph.nodes.length} узлов<br />
                                {graph.edges.length} связей
                            </div>
                        </div>
                    )}
                </aside>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: 80 }}>
                                <div style={{ fontSize: 64, marginBottom: 16 }}>{modeConfig[mode].emoji}</div>
                                <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                                    Анализ: {modeConfig[mode].label}
                                </h2>
                                <p style={{ color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
                                    {modeConfig[mode].description}. Задайте вопрос или выберите пример слева.
                                </p>
                            </div>
                        )}

                        {messages.map(message => (
                            <div
                                key={message.id}
                                style={{
                                    marginBottom: 20,
                                    display: 'flex',
                                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    maxWidth: '70%',
                                    padding: '14px 18px',
                                    borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: message.role === 'user' ? '#8b5cf6' : '#fff',
                                    color: message.role === 'user' ? '#fff' : '#1e293b',
                                    boxShadow: message.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                                }}>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{message.content}</div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
                                <div style={{
                                    padding: '14px 18px',
                                    borderRadius: '18px 18px 18px 4px',
                                    background: '#fff',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}>
                                    <span>⏳ Анализирую...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '16px 32px 24px',
                        background: '#fff',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Спросите о графе..."
                                style={{
                                    flex: 1,
                                    padding: '14px 18px',
                                    borderRadius: 12,
                                    border: '1px solid #e2e8f0',
                                    fontSize: 15,
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !inputValue.trim()}
                                style={{
                                    padding: '14px 24px',
                                    background: isLoading || !inputValue.trim() ? '#94a3b8' : '#8b5cf6',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontWeight: 500,
                                    cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Отправить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
