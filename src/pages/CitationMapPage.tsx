
import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GraphViewer from '@/components/GraphViewer'
import { Graph, GraphNode } from '../../shared/contracts/graph'
import { useApi } from '@/hooks/useApi'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function CitationMapPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

    // Fetch citation graph directly
    const { data: graph, loading } = useApi<Graph>(
        `/graphs/citation/${id}`,
        null,
        !!id
    )

    const handleNodeSelect = (node: GraphNode) => {
        setSelectedNode(node)
    }

    const filteredNodes = useMemo(() => {
        if (!graph) return []
        return graph.nodes.filter(node => {
            if (searchQuery && !node.label.toLowerCase().includes(searchQuery.toLowerCase())) return false
            return true
        })
    }, [graph, searchQuery])

    if (loading) {
        return (
            <div className="min-h-screen bg-void flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-acid animate-spin mx-auto" />
                    <p className="text-steel font-mono text-xs tracking-widest">BUILDING_CITATION_NETWORK...</p>
                </div>
            </div>
        )
    }

    if (!graph) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-steel-dim">
                    Wait, no graph found.
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            🕸️ Citation Network
                        </h1>
                        <div className="text-xs text-slate-500">
                            {graph.nodes.length} papers • {graph.edges.length} citations
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter papers..."
                        className="px-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64"
                    />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden">
                <GraphViewer
                    graph={graph}
                    onNodeSelect={handleNodeSelect}
                    selectedNodeId={selectedNode?.id}
                />

                {/* Node Details Overlay */}
                {selectedNode && (
                    <div className="absolute right-6 top-6 w-96 bg-white/95 backdrop-blur shadow-xl rounded-xl p-6 border border-slate-100 flex flex-col gap-4 animate-in slide-in-from-right-10 fade-in duration-200">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-snug">
                                {(selectedNode.data?.metadata?.fullTitle as string) || selectedNode.label}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                                    {(selectedNode.data?.metadata?.year as string | number) || 'Unknown Year'}
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                                    {(selectedNode.data?.metadata?.globalCitations as number) || 0} Citations
                                </span>
                            </div>
                        </div>

                        <div className="text-sm text-slate-600 line-clamp-4">
                            {((selectedNode.data?.metadata?.authors as string[]) || []).join(', ') || 'Unknown Authors'}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            {(selectedNode.data?.metadata?.doi as string) && (
                                <a
                                    href={`https://doi.org/${(selectedNode.data?.metadata as any)?.doi}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                                >
                                    Open DOI ↗
                                </a>
                            )}
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
