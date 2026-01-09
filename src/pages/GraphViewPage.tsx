import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GraphViewer from '@/components/GraphViewer'
import { Graph, GraphNode, GraphEdge } from '../../shared/contracts/graph'
import { EntityType } from '../../shared/contracts/entities'

type ViewMode = 'split' | 'graph' | 'table'

export default function GraphViewPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [graph, setGraph] = useState<Graph | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('split')
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchGraph()
    }, [id])

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
        } finally {
            setIsLoading(false)
        }
    }

    const nodeTypes = useMemo(() => {
        if (!graph) return []
        const types = new Set(graph.nodes.map(n => n.type || 'Concept'))
        return ['all', ...Array.from(types)]
    }, [graph])

    const filteredNodes = useMemo(() => {
        if (!graph) return []
        return graph.nodes.filter(node => {
            if (typeFilter !== 'all' && node.type !== typeFilter) return false
            if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) return false
            return true
        })
    }, [graph, typeFilter, searchQuery])

    const handleNodeSelect = (node: GraphNode) => {
        setSelectedNode(node)
    }

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                    <div style={{ color: '#64748b' }}>Загрузка графа...</div>
                </div>
            </div>
        )
    }

    if (!graph) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div style={{ color: '#64748b', marginBottom: 24 }}>Граф не найден</div>
                    <button
                        onClick={() => navigate(`/research/${id}/config`)}
                        style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    >
                        Построить граф
                    </button>
                </div>
            </div>
        )
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
                        onClick={() => navigate(`/research/${id}/config`)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14 }}
                    >
                        ← Настройки
                    </button>
                    <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        {graph.name}
                    </h1>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>
                        {graph.nodes.length} узлов • {graph.edges.length} связей
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* View Mode Toggle */}
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 2 }}>
                        {(['split', 'graph', 'table'] as ViewMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: viewMode === mode ? '#fff' : 'transparent',
                                    boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    color: viewMode === mode ? '#1e293b' : '#64748b'
                                }}
                            >
                                {mode === 'split' ? '⬛⬜' : mode === 'graph' ? '🕸️' : '📋'}
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <button
                        onClick={() => navigate(`/research/${id}/ai`)}
                        style={{ padding: '8px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                    >
                        🤖 AI Анализ
                    </button>
                    <button
                        onClick={() => navigate(`/research/${id}/report`)}
                        style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                    >
                        📝 Отчёт
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: viewMode === 'split' ? 'column' : 'row', overflow: 'hidden' }}>
                {/* Graph View */}
                {(viewMode === 'split' || viewMode === 'graph') && (
                    <div style={{
                        flex: viewMode === 'split' ? '0 0 60%' : 1,
                        borderBottom: viewMode === 'split' ? '1px solid #e2e8f0' : 'none',
                        position: 'relative'
                    }}>
                        <GraphViewer
                            graph={graph}
                            onNodeSelect={handleNodeSelect}
                            selectedNodeId={selectedNode?.id}
                        />

                        {/* Zoom Controls */}
                        <div style={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}>
                            <button style={{ width: 36, height: 36, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16 }}>+</button>
                            <button style={{ width: 36, height: 36, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 16, borderTop: '1px solid #e2e8f0' }}>−</button>
                            <button style={{ width: 36, height: 36, border: 'none', background: '#fff', cursor: 'pointer', fontSize: 14, borderTop: '1px solid #e2e8f0' }}>⟳</button>
                        </div>
                    </div>
                )}

                {/* Table View */}
                {(viewMode === 'split' || viewMode === 'table') && (
                    <div style={{
                        flex: viewMode === 'split' ? '0 0 40%' : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#fff'
                    }}>
                        {/* Table Header */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 12 }}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск..."
                                style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
                            />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
                            >
                                {nodeTypes.map(type => (
                                    <option key={type} value={type}>{type === 'all' ? 'Все типы' : type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Table */}
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', position: 'sticky', top: 0 }}>
                                        <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#475569' }}>Сущность</th>
                                        <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, color: '#475569' }}>Тип</th>
                                        <th style={{ textAlign: 'right', padding: '10px 16px', fontWeight: 600, color: '#475569' }}>Связи</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNodes.map(node => {
                                        const connectionCount = graph.edges.filter(e => e.source === node.id || e.target === node.id).length
                                        return (
                                            <tr
                                                key={node.id}
                                                onClick={() => handleNodeSelect(node)}
                                                style={{
                                                    cursor: 'pointer',
                                                    background: selectedNode?.id === node.id ? '#eff6ff' : '#fff',
                                                    borderBottom: '1px solid #f1f5f9'
                                                }}
                                            >
                                                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{node.label}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: 4,
                                                        fontSize: 11,
                                                        background: getTypeColor(node.type || 'Concept').bg,
                                                        color: getTypeColor(node.type || 'Concept').text
                                                    }}>
                                                        {node.type || 'Concept'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>{connectionCount}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Node Panel */}
            {selectedNode && (
                <div style={{
                    position: 'fixed',
                    bottom: 24,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    zIndex: 100
                }}>
                    <div>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{selectedNode.label}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{selectedNode.type || 'Concept'}</div>
                    </div>
                    <button
                        onClick={() => navigate(`/research/${id}/ai?node=${selectedNode.id}`)}
                        style={{ padding: '8px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                    >
                        🤖 Спросить AI
                    </button>
                    <button
                        onClick={() => setSelectedNode(null)}
                        style={{ padding: '8px 12px', background: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    )
}

function getTypeColor(type: string): { bg: string; text: string } {
    // lowercase keys for EntityType
    const colors: Record<string, { bg: string; text: string }> = {
        gene: { bg: '#dbeafe', text: '#1e40af' },
        protein: { bg: '#fce7f3', text: '#9d174d' },
        metabolite: { bg: '#d1fae5', text: '#065f46' },
        disease: { bg: '#fee2e2', text: '#991b1b' },
        drug: { bg: '#fef3c7', text: '#92400e' },
        pathway: { bg: '#e0e7ff', text: '#3730a3' },
        concept: { bg: '#f1f5f9', text: '#475569' },
        // Add new v2.0 types
        symptom: { bg: '#fee2e2', text: '#991b1b' },
        treatment: { bg: '#e0e7ff', text: '#3730a3' },
        mouse: { bg: '#f1f5f9', text: '#475569' } // fallback/extra
    }
    return colors[type.toLowerCase()] || colors.concept
}
