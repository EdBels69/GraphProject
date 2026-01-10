import { useState } from 'react'
import { Search, Loader2, BookOpen, Network, Atom, Globe } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { useApiPost } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface ResearchPanelProps {
    graphId: string
    onGraphUpdate: () => void
}

export function ResearchPanel({ graphId, onGraphUpdate }: ResearchPanelProps) {
    const [query, setQuery] = useState('')
    const { addToast } = useToast()

    const { data: result, loading: isLoading, postData } = useApiPost<{
        articlesFound: number,
        entitiesAdded: number,
        edgesAdded: number
    }>(API_ENDPOINTS.GRAPHS.RESEARCH(graphId))

    const handleResearch = async () => {
        if (!query.trim()) return

        try {
            const data = await postData({ query })
            if (data) {
                onGraphUpdate()
                addToast(`Research complete: ${data.articlesFound} documents analyzed`, 'success')
            }
        } catch (error) {
            console.error(error)
            addToast('Research sequence failed. Check system logs.', 'error')
        }
    }

    return (
        <div className="h-full flex flex-col p-4 space-y-6 font-sans">
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-steel flex items-center gap-2">
                    <Atom className="w-4 h-4 text-plasma" />
                    AUTONOMOUS_RESEARCHER
                </h3>
                <p className="text-[10px] text-steel font-mono">
                    AI Agent autonomously scans scientific repositories (Semantic Scholar/PubMed) to expand graph knowledge.
                </p>
            </div>

            <div className="glass-panel border-ash/20 p-4 rounded-xl space-y-4">
                <div className="space-y-3">
                    <label className="text-[10px] font-display font-bold text-acid tracking-widest uppercase mb-1 block">Target Topic</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-steel/30 z-10" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. 'CRISPR off-target effects'"
                                className="pl-10 py-2"
                                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                            />
                        </div>
                        <Button
                            onClick={handleResearch}
                            disabled={isLoading || !query.trim()}
                            variant="primary"
                            className="px-6 h-[46px]"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-acid/20 rounded-full blur-xl animate-pulse"></div>
                        <Loader2 className="w-10 h-10 animate-spin text-acid relative z-10" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-xs font-mono text-acid animate-pulse">ANALYZING_LITERATURE_STREAMS...</p>
                        <p className="text-[10px] text-steel">Extracting entities & semantic relationships</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="glass-panel border-ash/20 p-1 rounded-xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-void rounded-lg p-5">
                        <h4 className="font-display font-bold text-steel text-xs tracking-widest mb-4 flex items-center gap-2">
                            <Network className="w-4 h-4 text-acid" />
                            MISSION_COMPLETE
                        </h4>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="p-3 bg-steel/5 rounded-xl border border-ash/10">
                                <div className="text-xl font-display font-bold text-steel tracking-widest">{result.articlesFound}</div>
                                <div className="text-[9px] text-steel-dim uppercase tracking-tighter flex items-center justify-center gap-1 mt-1 font-bold">
                                    <BookOpen className="w-2.5 h-2.5" /> Papers
                                </div>
                            </div>
                            <div className="p-3 bg-steel/5 rounded-xl border border-ash/10">
                                <div className="text-xl font-display font-bold text-acid tracking-widest">+{result.entitiesAdded}</div>
                                <div className="text-[9px] text-steel-dim uppercase tracking-tighter mt-1 font-bold">Nodes</div>
                            </div>
                            <div className="p-3 bg-steel/5 rounded-xl border border-ash/10">
                                <div className="text-xl font-display font-bold text-plasma tracking-widest">+{result.edgesAdded}</div>
                                <div className="text-[9px] text-steel-dim uppercase tracking-tighter mt-1 font-bold">Edges</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
