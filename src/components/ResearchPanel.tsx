import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Loader2, BookOpen, Network, Atom, Globe } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface ResearchPanelProps {
    graphId: string
    onGraphUpdate: () => void
}

export function ResearchPanel({ graphId, onGraphUpdate }: ResearchPanelProps) {
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ articlesFound: number, entitiesAdded: number, edgesAdded: number } | null>(null)
    const { addToast } = useToast()

    const handleResearch = async () => {
        if (!query.trim()) return

        setIsLoading(true)
        setResult(null)
        try {
            const res = await fetch(`/api/graphs/${graphId}/research`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            })

            if (res.ok) {
                const json = await res.json()
                setResult(json.data)
                onGraphUpdate()
                addToast(`Research complete: ${json.data.articlesFound} documents analyzed`, 'success')
            } else {
                console.error('Research failed')
                addToast('Research sequence failed. Check system logs.', 'error')
            }
        } catch (error) {
            console.error(error)
            addToast('Network Error: Research modules unreachable', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col p-4 space-y-6 font-sans">
            <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Atom className="w-4 h-4 text-plasma" />
                    AUTONOMOUS_RESEARCHER
                </h3>
                <p className="text-[10px] text-steel font-mono">
                    AI Agent autonomously scans scientific repositories (Semantic Scholar/PubMed) to expand graph knowledge.
                </p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-acid tracking-widest uppercase">Target Topic</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Globe className="absolute left-3 top-2.5 w-4 h-4 text-steel/50" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. 'CRISPR off-target effects'"
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-steel/40 focus:outline-none focus:border-acid/50 focus:ring-1 focus:ring-acid/20 font-mono transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                            />
                        </div>
                        <button
                            onClick={handleResearch}
                            disabled={isLoading || !query.trim()}
                            className="bg-acid text-void hover:bg-white transition-colors px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-acid"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </button>
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
                <div className="p-1 rounded-xl bg-gradient-to-br from-acid/20 to-plasma/20 border border-white/10 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-black/80 backdrop-blur-xl rounded-lg p-5">
                        <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                            <Network className="w-4 h-4 text-acid" />
                            MISSION_COMPLETE
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-xl font-bold text-white font-mono">{result.articlesFound}</div>
                                <div className="text-[10px] text-steel uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
                                    <BookOpen className="w-3 h-3" /> Papers
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-xl font-bold text-acid font-mono">+{result.entitiesAdded}</div>
                                <div className="text-[10px] text-steel uppercase tracking-wider mt-1">New Nodes</div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-xl font-bold text-plasma font-mono">+{result.edgesAdded}</div>
                                <div className="text-[10px] text-steel uppercase tracking-wider mt-1">New Edges</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
