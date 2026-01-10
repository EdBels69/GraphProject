import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import ThinkingTerminal from '@/components/ThinkingTerminal'
import {
    ArrowLeft, Check, X, RotateCcw, Download, FileText,
    Settings, GripVertical, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react'

interface Article {
    id: string
    title: string
    authors: string[]
    year: number
    abstract?: string
    source: string
    doi?: string
    screeningStatus?: 'pending' | 'included' | 'excluded'
}

interface ResearchJob {
    id: string
    topic: string
    mode?: 'quick' | 'research'
    status: string
    articlesFound: number
    progress?: number
    articles?: Article[]
    graphId?: string
    error?: string
}

export default function PapersPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [job, setJob] = useState<ResearchJob | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { addToast } = useToast()

    // Column config
    type ColumnId = 'checkbox' | 'title' | 'year' | 'source' | 'status'
    interface Column {
        id: ColumnId
        label: string
        width?: number | string
    }
    const [columns, setColumns] = useState<Column[]>(() => {
        const saved = localStorage.getItem('papers_columns')
        if (saved) {
            try { return JSON.parse(saved) } catch { }
        }
        return [
            { id: 'checkbox', label: 'SELECT', width: 48 },
            { id: 'title', label: 'DOCUMENT TITLE' },
            { id: 'year', label: 'YEAR', width: 80 },
            { id: 'source', label: 'SOURCE', width: 100 },
            { id: 'status', label: 'STATUS', width: 120 }
        ]
    })
    const [draggingColumn, setDraggingColumn] = useState<ColumnId | null>(null)

    // Saved views logic
    interface SavedView {
        id: string
        name: string
        columns: Column[]
        filter?: 'all' | 'included' | 'excluded' | 'pending'
    }
    const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
        const saved = localStorage.getItem('papers_saved_views')
        if (saved) {
            try { return JSON.parse(saved) } catch { }
        }
        return []
    })
    const [currentFilter, setCurrentFilter] = useState<'all' | 'included' | 'excluded' | 'pending'>('all')

    useEffect(() => {
        localStorage.setItem('papers_columns', JSON.stringify(columns))
    }, [columns])

    useEffect(() => {
        localStorage.setItem('papers_saved_views', JSON.stringify(savedViews))
    }, [savedViews])

    // ... View management functions ...
    const saveCurrentView = () => {
        const name = prompt('View Status Name:')
        if (!name) return
        const newView: SavedView = {
            id: `view-${Date.now()}`,
            name,
            columns: [...columns],
            filter: currentFilter
        }
        setSavedViews(prev => [...prev, newView])
        addToast(`View "${name}" saved`, 'success')
    }

    const loadView = (view: SavedView) => {
        setColumns(view.columns)
        if (view.filter) setCurrentFilter(view.filter)
        addToast(`View "${view.name}" loaded`, 'info')
    }

    const isInProgress = (status: string) =>
        ['pending', 'searching', 'downloading', 'analyzing', 'processing'].includes(status)

    // Keyboard controls
    useEffect(() => {
        const articles = job?.articles || []
        if (articles.length === 0) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT') return

            switch (e.key.toLowerCase()) {
                case 'j':
                    setSelectedIndex(i => Math.min(i + 1, articles.length - 1))
                    break
                case 'k':
                    setSelectedIndex(i => Math.max(i - 1, 0))
                    break
                case 'i':
                    if (articles[selectedIndex]) {
                        setJob(prev => {
                            if (!prev?.articles) return prev
                            const updated = [...prev.articles]
                            updated[selectedIndex] = { ...updated[selectedIndex], screeningStatus: 'included' }
                            return { ...prev, articles: updated }
                        })
                    }
                    break
                case 'e':
                    if (articles[selectedIndex]) {
                        setJob(prev => {
                            if (!prev?.articles) return prev
                            const updated = [...prev.articles]
                            updated[selectedIndex] = { ...updated[selectedIndex], screeningStatus: 'excluded' }
                            return { ...prev, articles: updated }
                        })
                    }
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [job?.articles, selectedIndex])

    useEffect(() => {
        fetchJob()
        const interval = setInterval(fetchJob, 3000)
        setPollingInterval(interval)
        return () => clearInterval(interval)
    }, [id])

    useEffect(() => {
        if (job && !isInProgress(job.status) && pollingInterval) {
            clearInterval(pollingInterval)
        }
    }, [job?.status])

    const fetchJob = async () => {
        try {
            const response = await fetch(`/api/research/jobs/${id}`)
            if (response.ok) {
                const data = await response.json()
                setJob(data.job)
            }
        } catch (error) {
            console.error('Failed to fetch job:', error)
            addToast('Connection error', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleContinue = () => {
        if (job?.graphId) {
            navigate(`/research/${id}/graph`)
        } else {
            navigate(`/research/${id}/config`)
        }
    }

    if (isLoading || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-void">
                <Loader2 className="w-12 h-12 text-acid animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-32 animate-fade-in">
            {/* Header */}
            <div className="border-b border-white/5 pb-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-steel/60 hover:text-acid mb-4 transition-colors font-mono text-xs tracking-widest"
                >
                    <ArrowLeft className="w-3 h-3" /> SYSTEM_ROOT
                </button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight mb-2">
                            DATA STREAM: <span className="text-acid text-glow">{job.topic}</span>
                        </h1>
                        <div className="flex items-center gap-4 text-sm font-mono text-gray-400">
                            <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/10 uppercase">{job.status}</span>
                            <span>{job.articlesFound} RECORDS FOUND</span>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-white/5 rounded-lg border border-white/5">
                        {(['all', 'pending', 'included', 'excluded'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setCurrentFilter(f)}
                                className={`
                                  px-4 py-2 rounded-md text-xs font-bold font-display tracking-wider transition-all
                                  ${currentFilter === f ? 'bg-acid text-void shadow-glow-acid' : 'text-gray-500 hover:text-white'}
                                `}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            {isInProgress(job.status) && (
                <div className="glass-panel p-8 rounded-xl space-y-6">
                    <ThinkingTerminal jobId={job.id} status={job.status} />
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-acid shadow-glow-acid transition-all duration-300 relative"
                            style={{ width: `${job.progress || 10}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Data Table */}
            {job.articles && (
                <div className="glass-panel rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-white/5 bg-black/20 flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setJob({ ...job, articles: job.articles!.map(a => ({ ...a, screeningStatus: 'included' })) })}
                                className="px-3 py-1.5 bg-acid/10 border border-acid/20 text-acid rounded text-xs font-bold hover:bg-acid/20 transition-colors flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-3 h-3" /> INCLUDE ALL
                            </button>
                            <button
                                onClick={() => setJob({ ...job, articles: job.articles!.map(a => ({ ...a, screeningStatus: 'excluded' })) })}
                                className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2"
                            >
                                <AlertCircle className="w-3 h-3" /> EXCLUDE ALL
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <a href={`/api/research/jobs/${id}/export/csv`} className="px-3 py-1.5 bg-white/5 text-gray-400 hover:text-white rounded text-xs flex items-center gap-2 transition-colors">
                                <Download className="w-3 h-3" /> CSV
                            </a>
                            <a href={`/api/research/jobs/${id}/export/bibtex`} className="px-3 py-1.5 bg-white/5 text-gray-400 hover:text-white rounded text-xs flex items-center gap-2 transition-colors">
                                <FileText className="w-3 h-3" /> BIBTEX
                            </a>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-black/40 text-gray-500 font-display text-[10px] tracking-widest uppercase">
                                    {columns.map((col) => (
                                        <th
                                            key={col.id}
                                            draggable={col.id !== 'checkbox'}
                                            onDragStart={() => setDraggingColumn(col.id)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => {
                                                if (draggingColumn && draggingColumn !== col.id) {
                                                    const fromIndex = columns.findIndex(c => c.id === draggingColumn)
                                                    const toIndex = columns.findIndex(c => c.id === col.id)
                                                    const newCols = [...columns]
                                                    const [moved] = newCols.splice(fromIndex, 1)
                                                    newCols.splice(toIndex, 0, moved)
                                                    setColumns(newCols)
                                                }
                                                setDraggingColumn(null)
                                            }}
                                            className={`
                                                p-4 select-none
                                                ${col.id !== 'checkbox' ? 'cursor-grab active:cursor-grabbing hover:text-white transition-colors' : ''}
                                                ${draggingColumn === col.id ? 'bg-white/5' : ''}
                                            `}
                                            style={{ width: col.width }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                {col.id !== 'checkbox' && <GripVertical className="w-3 h-3 opacity-20" />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono text-sm">
                                {job.articles
                                    .filter(article => {
                                        if (currentFilter === 'all') return true
                                        if (currentFilter === 'pending') return article.screeningStatus === 'pending' || !article.screeningStatus
                                        return article.screeningStatus === currentFilter
                                    })
                                    .map((article, index) => {
                                        const isIncluded = article.screeningStatus === 'included'
                                        const isExcluded = article.screeningStatus === 'excluded'
                                        const isSelected = index === selectedIndex

                                        return (
                                            <tr
                                                key={article.id}
                                                onClick={() => setSelectedIndex(index)}
                                                className={`
                                                    group transition-all duration-150 cursor-pointer text-gray-300
                                                    ${isSelected ? 'bg-acid/5 shadow-[inset_2px_0_0_0_#CCFF00]' : 'hover:bg-white/5'}
                                                    ${isExcluded ? 'opacity-40 grayscale' : ''}
                                                `}
                                            >
                                                {columns.map(col => {
                                                    switch (col.id) {
                                                        case 'checkbox':
                                                            return (
                                                                <td key={col.id} className="p-4 text-center">
                                                                    <div
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            const newStatus = isIncluded ? 'pending' : 'included'
                                                                            const updated = job.articles!.map(a => a.id === article.id ? { ...a, screeningStatus: newStatus } : a)
                                                                            setJob({ ...job, articles: updated }) // @ts-ignore
                                                                        }}
                                                                        className={`
                                                                        w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer
                                                                        ${isIncluded
                                                                                ? 'bg-acid border-acid text-void'
                                                                                : 'bg-transparent border-white/20 hover:border-acid/50'}
                                                                      `}
                                                                    >
                                                                        {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                                                                    </div>
                                                                </td>
                                                            )
                                                        case 'title':
                                                            return (
                                                                <td key={col.id} className="p-4 min-w-[300px]">
                                                                    <div className={`font-body font-medium text-base mb-1 group-hover:text-white transition-colors ${isIncluded ? 'text-acid' : ''}`}>
                                                                        {article.title}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 truncate max-w-[500px]">
                                                                        {article.authors?.join(', ')}
                                                                    </div>
                                                                    {article.abstract && (
                                                                        <details className="mt-2 text-xs text-gray-500 open:text-gray-300">
                                                                            <summary className="cursor-pointer hover:text-acid transition-colors select-none">VIEW ABSTRACT</summary>
                                                                            <p className="mt-2 leading-relaxed pl-2 border-l border-white/10 font-sans opacity-80">
                                                                                {article.abstract}
                                                                            </p>
                                                                        </details>
                                                                    )}
                                                                </td>
                                                            )
                                                        case 'year':
                                                            return (
                                                                <td key={col.id} className="p-4 text-gray-500 group-hover:text-gray-300">
                                                                    {article.year}
                                                                </td>
                                                            )
                                                        case 'source':
                                                            return (
                                                                <td key={col.id} className="p-4">
                                                                    <span className={`
                                                                        text-[10px] px-2 py-1 rounded border uppercase tracking-wider
                                                                        ${article.source === 'pubmed'
                                                                            ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                                                            : 'border-orange-500/30 text-orange-400 bg-orange-500/10'}
                                                                    `}>
                                                                        {article.source}
                                                                    </span>
                                                                </td>
                                                            )
                                                        case 'status':
                                                            return (
                                                                <td key={col.id} className="p-4">
                                                                    <div className="flex gap-2">
                                                                        {!isExcluded && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    const updated = job.articles!.map(a => a.id === article.id ? { ...a, screeningStatus: 'excluded' as const } : a)
                                                                                    setJob({ ...job, articles: updated })
                                                                                }}
                                                                                className="p-1.5 rounded hover:bg-white/10 text-gray-600 hover:text-red-400 transition-colors"
                                                                                title="Exclude"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        {isExcluded && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    const updated = job.articles!.map(a => a.id === article.id ? { ...a, screeningStatus: 'pending' as const } : a)
                                                                                    setJob({ ...job, articles: updated })
                                                                                }}
                                                                                className="p-1.5 rounded hover:bg-white/10 text-red-500 hover:text-white transition-colors"
                                                                                title="Restore"
                                                                            >
                                                                                <RotateCcw className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            )
                                                        default: return null
                                                    }
                                                })}
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bottom Actions */}
            {job.status === 'completed' && (
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-void via-void/90 to-transparent pointer-events-none flex justify-center lg:justify-end lg:pr-12 gap-4">
                    <button
                        onClick={async () => {
                            setIsLoading(true);
                            // Logic (save screening)
                            const includedIds = job.articles!.filter(a => a.screeningStatus === 'included').map(a => a.id)
                            const excludedIds = job.articles!.filter(a => a.screeningStatus === 'excluded').map(a => a.id)
                            try {
                                await fetch(`/api/research/jobs/${id}/screening`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ includedIds, excludedIds })
                                })
                                navigate(`/research/${id}/config`)
                            } catch (e) {
                                console.error(e)
                            } finally {
                                setIsLoading(false)
                            }
                        }}
                        disabled={!job.articles?.some(a => a.screeningStatus === 'included')}
                        className={`
                            pointer-events-auto px-8 py-4 rounded-xl font-display font-bold tracking-widest text-lg shadow-2xl transition-all hover:scale-105 active:scale-95
                            ${job.articles?.some(a => a.screeningStatus === 'included')
                                ? 'bg-acid text-void shadow-glow-acid'
                                : 'bg-white/10 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        INITIALIZE CONFIGURATION →
                    </button>
                </div>
            )}
        </div>
    )
}
