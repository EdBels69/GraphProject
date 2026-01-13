import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GraphViewer from '@/components/GraphViewer'
import { GraphExportMenu } from '@/components/GraphExportMenu'
import { Graph, GraphNode, GraphEdge } from '../../shared/contracts/graph'
import { useApi } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Loader2 } from 'lucide-react'

type ViewMode = 'graph' | 'split' | 'list'

export default function GraphViewPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [viewMode, setViewMode] = useState<ViewMode>('split')
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    // Fetch job details first to get graphId
    const { data: jobData, loading: jobLoading } = useApi<{ graphId: string }>(`/research/jobs/${id}`)

    // Then fetch graph if graphId is available
    const { data: graphData, loading: graphLoading } = useApi<Graph>(
        jobData?.graphId ? API_ENDPOINTS.GRAPHS.BY_ID(jobData.graphId) : '',
        null,
        !!jobData?.graphId
    )

    const graph = graphData
    const isLoading = jobLoading || graphLoading

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
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-acid animate-spin mx-auto" />
                    <p className="text-steel font-mono text-xs tracking-widest">LOADING_GRAPH_DATA...</p>
                </div>
            </div>
        )
    }

    if (!graph) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-steel">Graph not found or not yet built.</p>
                    <button
                        onClick={() => navigate(`/research/${id}/build`)}
                        className="text-acid hover:underline"
                    >
                        Build Graph
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-void text-steel-light">
            {/* Header */}
            <header className="h-14 border-b border-ash/10 flex items-center justify-between px-6 bg-void/50 backdrop-blur z-10">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-plasma to-acid">
                        {graph.metadata?.name || 'Knowledge Graph'}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-steel-dim border-l border-ash/10 pl-4">
                        <span>{graph.nodes.length} nodes</span>
                        <span>•</span>
                        <span>{graph.edges.length} edges</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Controls */}
                    <div className="flex bg-ash/10 p-1 rounded-lg">
                        {(['graph', 'split', 'list'] as ViewMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    background: viewMode === mode ? '#fff' : 'transparent',
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
                        onClick={() => navigate(`/research/${id}/gaps`)}
                        style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                    >
                        🕳️ Gaps
                    </button>
                    <button
                        onClick={() => navigate(`/research/${id}/report`)}
                        style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                    >
                        📝 Отчёт
                    </button>
                    <GraphExportMenu graphId={graph.id} />
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
                    </div>
                )}

                {/* Data View */}
                {(viewMode === 'split' || viewMode === 'list') && (
                    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
                        <div className="max-w-2xl mx-auto space-y-6">
                            {/* Selected Node Details */}
                            {selectedNode && (
                                <div className="glass-panel p-6 rounded-xl border border-acid/20">
                                    <h3 className="text-xl font-bold text-white mb-2">{selectedNode.label}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-steel-dim block mb-1">Type</span>
                                            <span className="text-steel">{selectedNode.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-steel-dim block mb-1">Connections</span>
                                            <span className="text-steel">
                                                {graph.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length}
                                            </span>
                                        </div>
                                        {/* Dynamic Props */}
                                        {Object.entries(selectedNode.properties || {}).map(([key, val]) => (
                                            <div key={key}>
                                                <span className="text-steel-dim block mb-1 capitalize">{key}</span>
                                                <span className="text-steel">{String(val)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Filters */}
                            <div>
                                <h4 className="font-semibold mb-2">Filters</h4>
                                <div className="flex gap-2 mb-4">
                                    {nodeTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setTypeFilter(type)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${typeFilter === type
                                                    ? 'bg-acid text-void'
                                                    : 'bg-ash/20 text-steel hover:bg-ash/30'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search nodes..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-ash/10 border border-ash/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-acid/50"
                                />
                            </div>

                            {/* Node List */}
                            <div className="space-y-2">
                                {filteredNodes.map(node => (
                                    <div
                                        key={node.id}
                                        onClick={() => handleNodeSelect(node)}
                                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group transition-all ${selectedNode?.id === node.id
                                                ? 'bg-acid/10 border border-acid/30'
                                                : 'bg-ash/5 border border-transparent hover:bg-ash/10'
                                            }`}
                                    >
                                        <span className={selectedNode?.id === node.id ? 'text-acid' : 'text-steel'}>
                                            {node.label}
                                        </span>
                                        <span className="text-xs text-steel-dim px-2 py-1 rounded bg-black/20">
                                            {node.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
