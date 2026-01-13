import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Graph } from '../../shared/contracts/graph'
import { useApi, useApiPost } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { AnalysisMode, Message } from '@/components/analysis/types'
import { AnalysisSidebar } from '@/components/analysis/AnalysisSidebar'
import { AnalysisChat } from '@/components/analysis/AnalysisChat'

export default function AIAnalysisPage() {
    const { id } = useParams<{ id: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const [mode, setMode] = useState<AnalysisMode>('graph')
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const preselectedNode = searchParams.get('node')

    // Fetch job then graph
    const { data: jobData, loading: jobLoading } = useApi<{ graphId: string }>(API_ENDPOINTS.RESEARCH.JOBS(id || ''))
    const { data: graphData, loading: graphLoading } = useApi<Graph>(
        jobData?.graphId ? API_ENDPOINTS.GRAPHS.BY_ID(jobData.graphId) : '',
        null,
        !!jobData?.graphId
    )
    const graph = graphData

    const { postData: askGraph, loading: askLoading } = useApiPost<{ answer: string }>(API_ENDPOINTS.AI.ASK_GRAPH)

    const isLoading = jobLoading || graphLoading || askLoading

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
                    // @ts-ignore - backward compatibility for relations
                    relation: e.relation || ''
                })),
                nodeCount: graph.nodes.length,
                edgeCount: graph.edges.length
            } : null

            const data = await askGraph({
                question: userMessage.content,
                graphContext,
                analysisMode: mode
            })

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data?.answer || 'Не удалось получить ответ',
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
                <AnalysisSidebar
                    mode={mode}
                    setMode={setMode}
                    setInputValue={setInputValue}
                    graph={graph}
                />

                <AnalysisChat
                    mode={mode}
                    messages={messages}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    handleSend={handleSend}
                    isLoading={isLoading}
                    messagesEndRef={messagesEndRef}
                />
            </div>
        </div>
    )
}
