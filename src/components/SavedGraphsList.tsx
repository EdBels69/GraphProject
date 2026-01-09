import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Trash2, ExternalLink, Calendar, Pencil, Merge, CheckSquare, Square } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Graph } from '../../shared/contracts/graph'
import { GraphMergeService } from '../services/graphMergeService'

interface SavedGraphsListProps {
    currentGraphId?: string
    onLoadGraph?: (graphId: string) => void
}

export default function SavedGraphsList({ currentGraphId, onLoadGraph }: SavedGraphsListProps) {
    const [graphs, setGraphs] = useState<Graph[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [renameId, setRenameId] = useState<string | null>(null)
    const [newName, setNewName] = useState('')

    // Merge states
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
    const [processedMergeName, setProcessedMergeName] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        fetchGraphs()
    }, [])

    const fetchGraphs = async () => {
        try {
            const response = await fetch('/api/graphs')
            if (response.ok) {
                const data = await response.json()
                if (data.success && Array.isArray(data.graphs)) {
                    setGraphs(data.graphs)
                }
            }
        } catch (error) {
            console.error('Failed to fetch graphs:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        try {
            const response = await fetch(`/api/graphs/${deleteId}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                setGraphs(prev => prev.filter(g => g.id !== deleteId))
                setDeleteId(null)
            }
        } catch (error) {
            console.error('Failed to delete graph:', error)
        }
    }

    const confirmRename = async () => {
        if (!renameId || !newName.trim()) return
        try {
            // Need to implement PUT route support in backend or use a specific endpoint
            // Assuming PUT /api/graphs/:id updates metadata including name
            const graph = graphs.find(g => g.id === renameId)
            if (!graph) return

            const response = await fetch(`/api/graphs/${renameId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...graph, name: newName })
            })

            if (response.ok) {
                setGraphs(prev => prev.map(g => g.id === renameId ? { ...g, name: newName } : g))
                setRenameId(null)
            }
        } catch (error) {
            console.error('Failed to rename graph:', error)
        }
    }

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const handleMergeClick = () => {
        if (selectedIds.size < 2) return
        setProcessedMergeName(`Merged Graph ${new Date().toLocaleDateString()}`)
        setIsMergeModalOpen(true)
    }

    const executeMerge = async () => {
        try {
            const graphsToMerge = graphs.filter(g => selectedIds.has(g.id))
            const mergedGraph = GraphMergeService.mergeGraphs(graphsToMerge, processedMergeName)

            // Create a file to upload
            const blob = new Blob([JSON.stringify(mergedGraph)], { type: 'application/json' })
            const file = new File([blob], `${processedMergeName}.json`, { type: 'application/json' })

            const formData = new FormData()
            formData.append('file', file)

            setIsLoading(true)
            const response = await fetch('/api/graphs/upload', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                const result = await response.json()
                // Refresh list
                await fetchGraphs()
                // Reset interaction
                setIsSelectionMode(false)
                setSelectedIds(new Set())
                setIsMergeModalOpen(false)

                // Optionally auto-open
                if (result.data?.graph?.id) {
                    handleLoad(result.data.graph.id)
                }
            }
        } catch (error) {
            console.error('Merge failed:', error)
            alert('Merge failed. Check console.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLoad = (graphId: string) => {
        if (onLoadGraph) {
            onLoadGraph(graphId)
        } else {
            navigate(`?graphId=${graphId}`)
        }
    }

    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Загрузка списка графов...</div>
    }

    if (graphs.length === 0) {
        return (
            <Card className="p-6 text-center bg-gray-50 border-dashed">
                <p className="text-gray-500">Нет сохраненных графов</p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Сохраненные графы</h3>
                <div className="flex gap-2">
                    {isSelectionMode ? (
                        <>
                            <Button
                                variant="primary"
                                size="sm"
                                disabled={selectedIds.size < 2}
                                onClick={handleMergeClick}
                            >
                                <Merge className="w-4 h-4 mr-2" />
                                Объединить ({selectedIds.size})
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsSelectionMode(false)
                                    setSelectedIds(new Set())
                                }}
                            >
                                Отмена
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsSelectionMode(true)}
                        >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Выбрать
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {graphs.map(graph => (
                    <Card
                        key={graph.id}
                        className={`p-4 hover:shadow-md transition-shadow cursor-pointer border relative 
                            ${currentGraphId === graph.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}
                            ${isSelectionMode && selectedIds.has(graph.id) ? 'bg-blue-50 border-blue-300' : ''}
                        `}
                        onClick={() => {
                            if (isSelectionMode) {
                                toggleSelection(graph.id)
                            } else {
                                handleLoad(graph.id)
                            }
                        }}
                    >
                        {isSelectionMode && (
                            <div className="absolute top-4 right-4 z-10">
                                {selectedIds.has(graph.id) ? (
                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <Square className="w-5 h-5 text-gray-300" />
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-2 group">
                            <h4 className="font-medium text-gray-900 truncate pr-2 flex-1" title={graph.name}>
                                {graph.name}
                            </h4>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-500 hover:text-blue-600 p-1 h-auto"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setRenameId(graph.id)
                                        setNewName(graph.name)
                                    }}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDeleteId(graph.id)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 mb-3 space-y-1">
                            <div className="flex items-center">
                                <span className="font-medium mr-2">{graph.nodes.length}</span> узлов
                                <span className="mx-2">•</span>
                                <span className="font-medium mr-2">{graph.edges.length}</span> связей
                            </div>
                            <div className="flex items-center text-xs text-gray-400">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(graph.updatedAt || graph.createdAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full text-xs"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleLoad(graph.id)
                                }}
                            >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Открыть
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Удаление графа"
            >
                <div className="space-y-4">
                    <p>Вы действительно хотите удалить этот граф? Это действие нельзя отменить.</p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={() => setDeleteId(null)}>Отмена</Button>
                        <Button variant="danger" onClick={confirmDelete}>Удалить</Button>
                    </div>
                </div>
            </Modal>

            {/* Rename Modal */}
            <Modal
                isOpen={!!renameId}
                onClose={() => setRenameId(null)}
                title="Переименовать граф"
            >
                <div className="space-y-4">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Введите новое имя"
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={() => setRenameId(null)}>Отмена</Button>
                        <Button onClick={confirmRename}>Сохранить</Button>
                    </div>
                </div>
            </Modal>

            {/* Merge Modal */}
            <Modal
                isOpen={isMergeModalOpen}
                onClose={() => setIsMergeModalOpen(false)}
                title="Объединение графов"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Выбрано графов: {selectedIds.size}. Узлы с одинаковыми названиями будут объединены, веса связей просуммированы.
                    </p>
                    <Input
                        value={processedMergeName}
                        onChange={(e) => setProcessedMergeName(e.target.value)}
                        placeholder="Название нового графа"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={() => setIsMergeModalOpen(false)}>Отмена</Button>
                        <Button onClick={executeMerge} disabled={isLoading}>
                            {isLoading ? 'Объединение...' : 'Создать граф'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
