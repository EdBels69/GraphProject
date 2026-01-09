import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Loader2, BookOpen, Network } from 'lucide-react'

interface ResearchPanelProps {
    graphId: string
    onGraphUpdate: () => void
}

export function ResearchPanel({ graphId, onGraphUpdate }: ResearchPanelProps) {
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ articlesFound: number, entitiesAdded: number, edgesAdded: number } | null>(null)

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
            } else {
                console.error('Research failed')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="text-sm text-gray-500 mb-2">
                AI Agent autonomously searches for scientific papers and expands your graph with new findings.
            </div>

            <Card className="p-4 space-y-4 border-blue-100 bg-blue-50/50">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Research Topic</label>
                    <div className="flex gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., 'Latest CRISPR applications in oncology'"
                            className="flex-1 bg-white"
                            onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                        />
                        <Button
                            onClick={handleResearch}
                            disabled={isLoading || !query.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="animate-pulse">Analyzing scientific literature...</p>
                    <p className="text-xs">Connecting to Semantic Scholar & extracting entities</p>
                </div>
            )}

            {result && (
                <Card className="p-4 bg-green-50 border-green-200 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <Network className="w-4 h-4 mr-2" />
                        Mission Complete
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2 bg-white rounded shadow-sm">
                            <div className="text-2xl font-bold text-gray-800">{result.articlesFound}</div>
                            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                <BookOpen className="w-3 h-3" /> Papers
                            </div>
                        </div>
                        <div className="p-2 bg-white rounded shadow-sm">
                            <div className="text-2xl font-bold text-blue-600">+{result.entitiesAdded}</div>
                            <div className="text-xs text-gray-500">New Nodes</div>
                        </div>
                        <div className="p-2 bg-white rounded shadow-sm">
                            <div className="text-2xl font-bold text-purple-600">+{result.edgesAdded}</div>
                            <div className="text-xs text-gray-500">New Edges</div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
