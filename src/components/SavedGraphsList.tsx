import { useState } from 'react'
import { Trash2, ExternalLink, Calendar, Pencil, Merge, CheckSquare, Square, Share2, Network } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Graph } from '../../shared/contracts/graph'
import { GraphMergeService } from '../services/graphMergeService'
import { useToast } from '@/contexts/ToastContext'
import { useApi, useApiPut, useApiDelete, useApiPost } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'
import { Card } from './ui/Card'
import { supabase } from '../../supabase/client'

interface SavedGraphsListProps {
    currentGraphId?: string
    onLoadGraph?: (graphId: string) => void
}

export default function SavedGraphsList({ currentGraphId, onLoadGraph }: SavedGraphsListProps) {
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

    const { data: graphsData, loading: isLoading, refetch: fetchGraphs } = useApi<Graph[]>(API_ENDPOINTS.GRAPHS.BASE)
    const graphs = graphsData || []

    const { deleteData } = useApiDelete<any>((id: string) => API_ENDPOINTS.GRAPHS.BY_ID(id))
    const { putData } = useApiPut<Graph, any>((id: string) => API_ENDPOINTS.GRAPHS.BY_ID(id))
    const { postData: uploadMerge } = useApiPost<any>(API_ENDPOINTS.GRAPHS.UPLOAD)


    const confirmDelete = async () => {
        if (!deleteId) return
        try {
            await deleteData(deleteId)
            fetchGraphs()
            setDeleteId(null)
            addToast('Graph deleted', 'success')
        } catch (error) {
            console.error('Failed to delete graph:', error)
            addToast(error instanceof Error ? error.message : 'Delete failed', 'error')
        }
    }

    const confirmRename = async () => {
        if (!renameId || !newName.trim()) return
        try {
            const graph = graphs.find(g => g.id === renameId)
            if (!graph) return

            await putData({ ...graph, name: newName }, renameId)
            fetchGraphs()
            setRenameId(null)
            addToast('Graph renamed', 'success')
        } catch (error) {
            console.error('Failed to rename graph:', error)
            addToast(error instanceof Error ? error.message : 'Rename failed', 'error')
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

            // Special case for FormData - we can't use useApiPost directly with application/json
            // But we can manually fetch or update useApiPost to support FormData
            // For now, let's keep it simple and use a manual fetch with session
            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch('/api/graphs/upload', {
                method: 'POST',
                headers: {
                    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
                },
                body: formData
            })

            if (response.ok) {
                const result = await response.json()
                await fetchGraphs()
                setIsSelectionMode(false)
                setSelectedIds(new Set())
                setIsMergeModalOpen(false)

                if (result.data?.graph?.id) {
                    handleLoad(result.data.graph.id)
                }
                addToast(`Merged ${graphsToMerge.length} graphs. Created ${mergedGraph.nodes.length} nodes.`, 'success')
            }
        } catch (error) {
            console.error('Merge failed:', error)
            addToast('Merge failed', 'error')
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
            <Card className="p-8 text-center border-dashed border-ash/30 bg-void">
                <Network className="w-8 h-8 text-steel/20 mx-auto mb-3" />
                <p className="text-steel-dim text-xs font-display tracking-widest uppercase">No graphs found in local repository</p>
            </Card>
        )
    }

    return (
        <div className="space-y-4 font-sans pb-20">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-steel-dim" />
                    <h3 className="text-xs font-bold text-steel uppercase tracking-wider">Available Graphs</h3>
                    <span className="bg-steel/10 text-steel text-[10px] px-1.5 rounded-sm font-mono font-bold">{graphs.length}</span>
                </div>

                <div className="flex gap-2">
                    {isSelectionMode ? (
                        <>
                            <Button
                                size="sm"
                                variant="primary"
                                disabled={selectedIds.size < 2}
                                onClick={handleMergeClick}
                                className="px-4"
                            >
                                <Merge className="w-3 h-3" />
                                MERGE ({selectedIds.size})
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setIsSelectionMode(false)
                                    setSelectedIds(new Set())
                                }}
                            >
                                CANCEL
                            </Button>
                        </>
                    ) : (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setIsSelectionMode(true)}
                        >
                            <CheckSquare className="w-3 h-3 text-acid" />
                            SELECT
                        </Button>
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
                                : 'bg-void border-ash/20 hover:border-ash/40 hover:bg-white'}
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
                                    <CheckSquare className="w-5 h-5 text-indigo-500 drop-shadow-md" />
                                ) : (
                                    <Square className="w-5 h-5 text-steel/20" />
                                )}
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3 pr-6">
                            <h4 className={`font-bold text-sm truncate pr-2 flex-1 ${currentGraphId === graph.id ? 'text-acid' : 'text-steel'}`} title={graph.metadata.name}>
                                {graph.metadata.name}
                            </h4>

                            {!isSelectionMode && (
                                <div className="hidden group-hover:flex space-x-1 absolute top-3 right-3 bg-white/80 rounded-lg p-1 backdrop-blur-md border border-ash/20 shadow-sm">
                                    <button
                                        className="text-steel-dim hover:text-steel p-1.5 rounded hover:bg-steel/5 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setRenameId(graph.id)
                                            setNewName(graph.metadata.name)
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

                        <div className="flex items-center gap-4 text-[10px] text-steel-dim font-mono mb-3">
                            <div className="flex items-center gap-1.5 bg-steel/5 px-2 py-1 rounded">
                                <Network className="w-3 h-3" />
                                <span className="text-steel font-bold">{graph.nodes.length}</span> NODES
                            </div>
                            <div className="flex items-center gap-1.5 bg-steel/5 px-2 py-1 rounded">
                                <Share2 className="w-3 h-3" />
                                <span className="text-steel font-bold">{graph.edges.length}</span> EDGES
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-ash/10">
                            <div className="flex items-center text-[10px] text-steel-dim/50 font-display tracking-widest uppercase">
                                <Calendar className="w-3 h-3 mr-1.5" />
                                {new Date(graph.updatedAt || graph.metadata.createdAt).toLocaleDateString()}
                            </div>

                            {!isSelectionMode && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLoad(graph.id)
                                    }}
                                    className="text-[10px] bg-steel/5 hover:bg-acid hover:text-void text-steel-dim px-3 py-1 rounded-lg transition-all duration-300 font-display font-bold tracking-widest uppercase border border-ash/10"
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
