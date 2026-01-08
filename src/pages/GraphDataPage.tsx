import { useState, useEffect } from 'react'
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Search, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Graph, GraphNode, GraphEdge } from '../../shared/types'
import { exportToWord, exportToPDF, downloadBlob } from '@/services/exportService'

export default function GraphDataPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { id } = useParams()
    const [graph, setGraph] = useState<Graph | null>(null)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Tries to load graph from state, otherwise fetch provided ID
        if (location.state?.graph) {
            setGraph(location.state.graph)
            setLoading(false)
        } else if (id) {
            // Fetch logic would go here, omitting for brevity as usually state is passed
            // In a real app we'd fetch /api/graphs/:id
            setLoading(false)
        } else {
            setLoading(false)
        }
    }, [location.state, id])

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Загрузка данных...</div>
    }

    if (!graph) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Граф не найден</h2>
                <Link to="/analysis"><Button>Вернуться к анализу</Button></Link>
            </div>
        )
    }

    // Prepare table rows: Edge Source -> Edge Target (Category)
    // We map edges to rows
    const rows = graph.edges.map(edge => {
        const sourceNode = graph.nodes.find(n => n.id === edge.source)
        const targetNode = graph.nodes.find(n => n.id === edge.target)
        return {
            id: edge.id,
            sourceId: edge.source,
            sourceLabel: sourceNode?.label || edge.source,
            sourceType: sourceNode?.data?.type || 'Entity',
            targetId: edge.target,
            targetLabel: targetNode?.label || edge.target,
            targetType: targetNode?.data?.type || 'Category',
            weight: edge.weight || 1
        }
    }).filter(row =>
        row.sourceLabel.toLowerCase().includes(search.toLowerCase()) ||
        row.targetLabel.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Назад к графу
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{graph.name}: Таблица связей</h1>
                            <p className="text-sm text-gray-500">Все извлеченные сущности и их категории</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none w-64"
                            />
                        </div>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Экспорт CSV
                        </Button>
                    </div>
                </div>

                {/* Main Table Card */}
                <Card className="overflow-hidden shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Источник (Entity)</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип Источника</th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Связь</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория / Цель</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вес</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{row.sourceLabel}</div>
                                            <div className="text-xs text-gray-400">{row.sourceId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {row.sourceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                                            →
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{row.targetLabel}</div>
                                            <div className="text-xs text-gray-400">{row.targetId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {row.weight}
                                        </td>
                                    </tr>
                                ))}
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Ничего не найдено
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border-t text-sm text-gray-500">
                        Показано {rows.length} связей
                    </div>
                </Card>
            </div>
        </div>
    )
}
