import { useState } from 'react'
import { Graph, GraphNode } from '../../shared/contracts/graph'
import { Search, Database, Share2, ArrowUpDown } from 'lucide-react'

interface GraphDataTableProps {
    graph: Graph
    onNodeSelect: (node: GraphNode) => void
}

export default function GraphDataTable({ graph, onNodeSelect }: GraphDataTableProps) {
    const [activeTab, setActiveTab] = useState<'nodes' | 'edges'>('nodes')
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState<string>('weight')
    const [sortAsc, setSortAsc] = useState(false)

    const filteredNodes = graph.nodes
        .filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const valA = a[sortField as keyof GraphNode] || 0
            const valB = b[sortField as keyof GraphNode] || 0
            return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
        })

    const filteredEdges = graph.edges
        .filter(e =>
            e.source.toLowerCase().includes(search.toLowerCase()) ||
            e.target.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const valA = a.weight || 0
            const valB = b.weight || 0
            return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
        })

    return (
        <div className="flex flex-col h-full bg-transparent border border-ash/20 rounded-xl overflow-hidden font-sans shadow-sm">
            {/* Header Controls */}
            <div className="p-4 border-b border-ash/10 bg-void space-y-4 backdrop-blur-sm">
                <div className="flex space-x-1 border-b border-ash/10 pb-1">
                    <button
                        className={`
                             flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center justify-center gap-2
                             ${activeTab === 'nodes'
                                ? 'bg-acid/10 text-acid border-b-2 border-acid'
                                : 'text-steel-dim hover:text-steel hover:bg-steel/5'}
                        `}
                        onClick={() => setActiveTab('nodes')}
                    >
                        <Database className="w-3 h-3" />
                        NODES ({graph.nodes.length})
                    </button>
                    <button
                        className={`
                             flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all flex items-center justify-center gap-2
                             ${activeTab === 'edges'
                                ? 'bg-plasma/10 text-plasma border-b-2 border-plasma'
                                : 'text-steel-dim hover:text-steel hover:bg-steel/5'}
                        `}
                        onClick={() => setActiveTab('edges')}
                    >
                        <Share2 className="w-3 h-3" />
                        EDGES ({graph.edges.length})
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-steel-dim" />
                    <input
                        type="text"
                        placeholder="SEARCH_DATASTREAM..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-ash/30 rounded-lg pl-9 pr-4 py-2 text-sm text-steel placeholder:text-steel-dim focus:outline-none focus:border-acid focus:ring-1 focus:ring-acid/20 font-mono transition-all"
                    />
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto bg-void custom-scrollbar">
                <table className="min-w-full divide-y divide-ash/10">
                    <thead className="bg-steel/5 sticky top-0 z-10 backdrop-blur-xl">
                        <tr>
                            {activeTab === 'nodes' ? (
                                <>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-steel-dim uppercase tracking-widest cursor-pointer hover:text-steel transition-colors" onClick={() => setSortField('label')}>
                                        <div className="flex items-center gap-1">Identifier <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-steel-dim uppercase tracking-widest cursor-pointer hover:text-steel transition-colors" onClick={() => setSortField('weight')}>
                                        <div className="flex items-center gap-1">Weight <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-steel-dim uppercase tracking-widest">Type</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-steel-dim uppercase tracking-widest">Source</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-steel-dim uppercase tracking-widest">Target</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-steel-dim uppercase tracking-widest cursor-pointer hover:text-steel transition-colors" onClick={() => { setSortField('weight'); setSortAsc(!sortAsc) }}>
                                        <div className="flex items-center gap-1">Strength <ArrowUpDown className="w-3 h-3 opacity-50" /></div>
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ash/10">
                        {activeTab === 'nodes' ? (
                            filteredNodes.map((node, idx) => (
                                <tr
                                    key={node.id}
                                    onClick={() => onNodeSelect(node)}
                                    className={`
                                        cursor-pointer transition-colors group
                                        ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}
                                        hover:bg-acid/10 hover:border-l-2 hover:border-acid
                                    `}
                                >
                                    <td className="px-6 py-3 whitespace-nowrap text-xs font-mono font-medium text-steel group-hover:text-acid transition-colors">{node.label}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-xs text-steel-dim group-hover:text-steel">{node.weight}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-xs">
                                        <span className="bg-steel/10 text-steel-dim px-2 py-0.5 rounded text-[10px] uppercase font-bold">{node.type || 'ENTITY'}</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            filteredEdges.map((edge, idx) => (
                                <tr
                                    key={edge.id}
                                    className={`
                                        ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}
                                        hover:bg-plasma/10 transition-colors
                                    `}
                                >
                                    <td className="px-6 py-3 whitespace-nowrap text-xs font-mono text-steel-dim">{edge.source}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-xs font-mono text-steel-dim">{edge.target}</td>
                                    <td className="px-6 py-3 whitespace-nowrap text-xs text-plasma font-bold">{edge.weight}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
