import { useState } from 'react'
import { Graph, GraphNode } from '../../shared/contracts/graph'
import { Search } from 'lucide-react'

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
        <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm overflow-hidden">
            {/* Header Controls */}
            <div className="p-4 border-b bg-gray-50 space-y-3">
                <div className="flex space-x-2 border-b border-gray-200">
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'nodes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('nodes')}
                    >
                        Узлы ({graph.nodes.length})
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'edges' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('edges')}
                    >
                        Связи ({graph.edges.length})
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            {activeTab === 'nodes' ? (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setSortField('label')}>Label</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => setSortField('weight')}>Weight</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => { setSortField('weight'); setSortAsc(!sortAsc) }}>Weight</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activeTab === 'nodes' ? (
                            filteredNodes.map(node => (
                                <tr
                                    key={node.id}
                                    onClick={() => onNodeSelect(node)}
                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{node.label}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{node.weight}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{node.type || 'Entity'}</td>
                                </tr>
                            ))
                        ) : (
                            filteredEdges.map(edge => (
                                <tr key={edge.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{edge.source}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{edge.target}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">{edge.weight}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
