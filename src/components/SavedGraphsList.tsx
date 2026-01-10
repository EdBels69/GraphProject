import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Trash2, ExternalLink, Calendar, Pencil, Merge, CheckSquare, Square, Share2, Network } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Graph } from '../../shared/contracts/graph'
import { GraphMergeService } from '../services/graphMergeService'
import { useToast } from '@/contexts/ToastContext'

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
    const { addToast } = useToast()

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
                addToast(`Merged ${graphsToMerge.length} graphs. Created ${mergedGraph.nodes.length} nodes.`, 'success')
            }
        } catch (error) {
            console.error('Merge failed:', error)
            addToast('Merge failed', 'error')
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
        return (
            <div className="p-10 text-center flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin"></div>
                <div className="text-acid font-mono text-xs animate-pulse">LOADING_REPOSITORY...</div>
            </div>
        )
    }

    if (graphs.length === 0) {
        return (
            <div className="p-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <Network className="w-8 h-8 text-steel mx-auto mb-3 opacity-50" />
                <p className="text-steel text-sm">No graphs found in local repository</p>
            </div>
        )
    }

    return (
        <div className="space-y-4 font-sans pb-20">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-white/70" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Available Graphs</h3>
                    <span className="bg-white/10 text-white text-[10px] px-1.5 rounded-sm font-mono">{graphs.length}</span>
                </div>

                <div className="flex gap-2">
                    {isSelectionMode ? (
                        <>
                            <button
                                disabled={selectedIds.size < 2}
                                onClick={handleMergeClick}
                                className="flex items-center gap-2 px-3 py-1.5 bg-acid text-void rounded text-xs font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Merge className="w-3 h-3" />
                                MERGE ({selectedIds.size})
                            </button>
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false)
                                    setSelectedIds(new Set())
                                }}
                                className="px-3 py-1.5 text-steel hover:text-white text-xs transition-colors"
                            >
                                CANCEL
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded text-xs transition-colors"
                        >
                            <CheckSquare className="w-3 h-3 text-steel" />
                            SELECT
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-3 grid-cols-1">
                {graphs.map(graph => (
                    <div
                        key={graph.id}
                        className={`
                            relative group p-4 rounded-xl border transition-all cursor-pointer backdrop-blur-sm
                            ${currentGraphId === graph.id
                                ? 'bg-acid/5 border-acid/50 shadow-glow-acid'
                                : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}
                            ${isSelectionMode && selectedIds.has(graph.id) ? 'bg-indigo-500/10 border-indigo-500/50' : ''}
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
                                    <CheckSquare className="w-5 h-5 text-indigo-400 drop-shadow-lg" />
                                ) : (
                                    <Square className="w-5 h-5 text-white/20" />
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3 pr-6">
                            <h4 className={`font-bold text-sm truncate pr-2 flex-1 ${currentGraphId === graph.id ? 'text-acid' : 'text-white'}`} title={graph.name}>
                                {graph.name}
                            </h4>

                            {!isSelectionMode && (
                                <div className="hidden group-hover:flex space-x-1 absolute top-3 right-3 bg-black/50 rounded-lg p-1 backdrop-blur-md border border-white/10">
                                    <button
                                        className="text-steel hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setRenameId(graph.id)
                                            setNewName(graph.name)
                                        }}
                                        title="Rename"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                        className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteId(graph.id)
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-steel font-mono mb-3">
                            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                                <Network className="w-3 h-3" />
                                <span className="text-white">{graph.nodes.length}</span> NODES
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                                <Share2 className="w-3 h-3" />
                                <span className="text-white">{graph.edges.length}</span> EDGES
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <div className="flex items-center text-[10px] text-white/40">
                                <Calendar className="w-3 h-3 mr-1.5" />
                                {new Date(graph.updatedAt || graph.createdAt).toLocaleDateString()}
                            </div>

                            {!isSelectionMode && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLoad(graph.id)
                                    }}
                                    className="text-[10px] bg-white/5 hover:bg-acid hover:text-void text-steel px-2 py-1 rounded transition-colors"
                                >
                                    OPEN_GRAPH &rarr;
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="DELETE_CONFIRMATION"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Permanently delete this graph from the repository? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={() => setDeleteId(null)}>CANCEL</Button>
                        <Button variant="danger" onClick={confirmDelete}>DELETE</Button>
                    </div>
                </div>
            </Modal>

            {/* Rename Modal */}
            <Modal
                isOpen={!!renameId}
                onClose={() => setRenameId(null)}
                title="RENAME_GRAPH"
            >
                <div className="space-y-4">
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new designation..."
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={() => setRenameId(null)}>CANCEL</Button>
                        <Button onClick={confirmRename}>SAVE</Button>
                    </div>
                </div>
            </Modal>

            {/* Merge Modal */}
            <Modal
                isOpen={isMergeModalOpen}
                onClose={() => setIsMergeModalOpen(false)}
                title="MERGE_PROTOCOL"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        Merging {selectedIds.size} graphs. Nodes with identical labels will be fused.
                    </p>
                    <Input
                        value={processedMergeName}
                        onChange={(e) => setProcessedMergeName(e.target.value)}
                        placeholder="Merged Graph Designation"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={() => setIsMergeModalOpen(false)}>CANCEL</Button>
                        <Button onClick={executeMerge} disabled={isLoading}>
                            {isLoading ? 'PROCESSING...' : 'EXECUTE_MERGE'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    )
}
