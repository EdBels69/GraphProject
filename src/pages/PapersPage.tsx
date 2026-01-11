import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import ThinkingTerminal from '@/components/ThinkingTerminal'
import {
    ArrowLeft, Check, X, RotateCcw, Download, FileText,
    Settings, GripVertical, CheckCircle2, AlertCircle, Loader2,
    ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

interface Article {
    id: string
    title: string
    authors: string[]
    year: number
    abstract?: string
    source: string
    doi?: string
    url?: string
    impactFactor?: number
    citations?: string[]
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
    const { t } = useTranslation()
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { addToast } = useToast()

    // Core data fetching
    const { data: jobData, loading: initialLoading, refetch } = useApi<{ job: ResearchJob }>(API_ENDPOINTS.RESEARCH.JOBS(id || ''))

    const [job, setJob] = useState<ResearchJob | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [sortConfig, setSortConfig] = useState<{ key: keyof Article; direction: 'asc' | 'desc' }>({ key: 'year', direction: 'desc' })

    useEffect(() => {
        if (jobData?.job) {
            setJob(jobData.job)
        }
    }, [jobData])

    // Polling logic
    useEffect(() => {
        if (!id) return
        const interval = setInterval(() => {
            if (job && isInProgress(job.status)) {
                refetch()
            }
        }, 5000) // Increased poll interval to reduce load
        return () => clearInterval(interval)
    }, [id, job?.status])

    // Column config
    type ColumnId = 'checkbox' | 'title' | 'year' | 'source' | 'if' | 'citations' | 'status'
    interface Column {
        id: ColumnId
        label: string
        width?: number | string
        sortable?: boolean
    }
    const [columns, setColumns] = useState<Column[]>([
        { id: 'checkbox', label: '', width: 48, sortable: false },
        { id: 'title', label: t('papers.col_title'), sortable: true },
        { id: 'year', label: t('papers.col_year'), width: 100, sortable: true },
        { id: 'source', label: t('papers.col_source'), width: 120, sortable: true },
        { id: 'if', label: 'IF', width: 80, sortable: true },
        { id: 'citations', label: 'Cit.', width: 80, sortable: false },
        { id: 'status', label: t('papers.col_status'), width: 120, sortable: false }
    ])

    const [currentFilter, setCurrentFilter] = useState<'all' | 'included' | 'excluded' | 'pending'>('all')

    const [yearFilter, setYearFilter] = useState<{ min: string, max: string }>({ min: '', max: '' })
    const [sourceFilter, setSourceFilter] = useState<string>('all')

    const isInProgress = (status: string) =>
        ['pending', 'searching', 'downloading', 'analyzing', 'processing'].includes(status)

    // Derived Data Processing
    const processedArticles = useMemo(() => {
        if (!job?.articles) return []

        let filtered = job.articles.filter(article => {
            // Status Filter
            if (currentFilter !== 'all') {
                if (currentFilter === 'pending') {
                    if (article.screeningStatus && article.screeningStatus !== 'pending') return false
                } else {
                    if (article.screeningStatus !== currentFilter) return false
                }
            }

            // Source Filter
            if (sourceFilter !== 'all') {
                if (article.source !== sourceFilter) return false
            }

            // Year Filter
            if (yearFilter.min) {
                if (!article.year || article.year < parseInt(yearFilter.min)) return false
            }
            if (yearFilter.max) {
                if (!article.year || article.year > parseInt(yearFilter.max)) return false
            }

            return true
        })

        return filtered.sort((a, b) => {
            const aValue = a[sortConfig.key]
            const bValue = b[sortConfig.key]

            if (aValue === undefined && bValue === undefined) return 0
            if (aValue === undefined) return 1
            if (bValue === undefined) return -1

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [job?.articles, currentFilter, sortConfig, yearFilter, sourceFilter])

    // Pagination Logic
    const totalPages = Math.ceil(processedArticles.length / pageSize)
    const paginatedArticles = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return processedArticles.slice(start, start + pageSize)
    }, [processedArticles, currentPage, pageSize])

    const handleSort = (key: keyof Article) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleTransition = () => {
        if (job?.graphId) {
            navigate(`/research/${id}/graph`)
        } else {
            navigate(`/research/${id}/config`)
        }
    }

    const isLoading = initialLoading && !job

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-void">
                <Loader2 className="w-12 h-12 text-acid animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-32 animate-fade-in text-steel">
            {/* Header */}
            <div className="border-b border-ash/10 pb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-steel-dim hover:text-acid mb-4 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> {t('common.back')}
                </Button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div>
                        <h1 className="mb-2 text-steel text-3xl font-bold tracking-tight">
                            {t('papers.topic_prefix')} <span className="text-acid">{job?.topic}</span>
                        </h1>
                        <div className="flex items-center gap-4 text-sm font-medium text-steel-dim">
                            <span className="bg-zinc-100 px-3 py-1 rounded-md border border-ash/40">
                                {t('papers.status_prefix')} {job?.status === 'completed' ? t('papers.completed') : t('papers.processing')}
                            </span>
                            <span className="text-sm">
                                {job?.articlesFound} {t('papers.records_found')}
                            </span>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1 bg-zinc-100 rounded-lg border border-ash/40">
                        {(['all', 'pending', 'included', 'excluded'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => { setCurrentFilter(f); setCurrentPage(1) }}
                                className={`
                                  px-4 py-2 rounded-md text-sm font-semibold transition-all
                                  ${currentFilter === f ? 'bg-white text-acid shadow-sm border border-ash/20' : 'text-steel-dim hover:text-steel'}
                                `}
                            >
                                {f === 'all' ? t('papers.filter_all') : f === 'pending' ? t('papers.filter_pending') : f === 'included' ? t('papers.filter_included') : t('papers.filter_excluded')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            {isInProgress(job?.status || '') && (
                <div className="glass-panel border-ash/20 p-8 rounded-xl space-y-6 mb-8">
                    <ThinkingTerminal jobId={job?.id || ''} status={job?.status || ''} />
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-acid transition-all duration-300 relative"
                            style={{ width: `${job?.progress || 10}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Main Data Table */}
            {job?.articles && (
                <div className="bg-white rounded-xl shadow-sm border border-ash/20 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-ash/10 bg-zinc-50 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-20">
                        <div className="flex gap-2 items-center">
                            <span className="text-xs font-semibold text-steel-dim uppercase tracking-wider mr-2">
                                Bulk Actions:
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setJob({ ...job, articles: job.articles!.map(a => ({ ...a, screeningStatus: 'included' })) })}
                                className="text-xs h-8 bg-white"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Include All
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setJob({ ...job, articles: job.articles!.map(a => ({ ...a, screeningStatus: 'excluded' })) })}
                                className="text-xs h-8 bg-white hover:text-red-600 hover:border-red-200"
                            >
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> Exclude All
                            </Button>
                        </div>

                        <div className="flex gap-4 items-center">
                            {/* Source Filter */}
                            <div className="flex items-center gap-2 mr-2 text-sm text-steel-dim">
                                <span>Source:</span>
                                <select
                                    value={sourceFilter}
                                    onChange={(e) => { setSourceFilter(e.target.value); setCurrentPage(1) }}
                                    className="bg-white border border-ash/30 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-acid outline-none"
                                >
                                    <option value="all">All</option>
                                    <option value="pubmed">PubMed</option>
                                    <option value="crossref">Crossref</option>
                                    <option value="scholar">Scholar</option>
                                    <option value="arxiv">ArXiv</option>
                                    <option value="biorxiv">BioRxiv</option>
                                </select>
                            </div>

                            {/* Year Filter Controls */}
                            <div className="flex items-center gap-2 text-sm text-steel-dim border-r border-ash/20 pr-4 mr-2">
                                <span className="text-xs font-medium">Year:</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={yearFilter.min}
                                    onChange={(e) => setYearFilter(prev => ({ ...prev, min: e.target.value }))}
                                    className="w-16 px-2 py-1 text-xs border border-ash/30 rounded bg-white focus:ring-1 focus:ring-acid outline-none"
                                />
                                <span className="text-ash">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={yearFilter.max}
                                    onChange={(e) => setYearFilter(prev => ({ ...prev, max: e.target.value }))}
                                    className="w-16 px-2 py-1 text-xs border border-ash/30 rounded bg-white focus:ring-1 focus:ring-acid outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 mr-4 text-sm text-steel-dim">
                                <span>Show:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                                    className="bg-white border border-ash/30 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-acid outline-none"
                                >
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            <a href={`/api/research/jobs/${id}/export/csv`} className="px-3 py-1.5 bg-white border border-ash/30 text-steel-dim hover:text-steel rounded-md text-xs font-medium flex items-center gap-2 transition-all">
                                <Download className="w-3.5 h-3.5" /> CSV
                            </a>
                            <a href={`/api/research/jobs/${id}/export/bibtex`} className="px-3 py-1.5 bg-white border border-ash/30 text-steel-dim hover:text-steel rounded-md text-xs flex items-center gap-2 transition-all font-medium">
                                <FileText className="w-3.5 h-3.5" /> BibTeX
                            </a>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[600px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-50 sticky top-[65px] z-10 shadow-sm">
                                <tr>
                                    {columns.map((col) => (
                                        <th
                                            key={col.id}
                                            onClick={() => col.sortable && handleSort(col.id as any)}
                                            className={`
                                                p-4 text-xs font-bold text-steel-dim 
                                                border-b border-ash/20 select-none
                                                ${col.sortable ? 'cursor-pointer hover:bg-zinc-100 hover:text-acid transition-colors' : ''}
                                            `}
                                            style={{ width: col.width }}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.label}
                                                {col.sortable && sortConfig.key === col.id && (
                                                    sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-acid" /> : <ArrowDown className="w-3 h-3 text-acid" />
                                                )}
                                                {col.sortable && sortConfig.key !== col.id && (
                                                    <ArrowUpDown className="w-3 h-3 opacity-20" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-ash/10 text-sm">
                                {paginatedArticles.map((article) => {
                                    const isIncluded = article.screeningStatus === 'included'
                                    const isExcluded = article.screeningStatus === 'excluded'

                                    return (
                                        <tr
                                            key={article.id}
                                            className={`
                                                group transition-colors hover:bg-zinc-50
                                                ${isIncluded ? 'bg-acid/5 hover:bg-acid/10' : ''}
                                                ${isExcluded ? 'opacity-50 grayscale bg-zinc-50/50' : ''}
                                            `}
                                        >
                                            {columns.map(col => {
                                                switch (col.id) {
                                                    case 'checkbox':
                                                        return (
                                                            <td key={col.id} className="p-4 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        const newStatus: 'pending' | 'included' = isIncluded ? 'pending' : 'included'
                                                                        const updated = job!.articles!.map(a => a.id === article.id ? { ...a, screeningStatus: newStatus } : a)
                                                                        setJob({ ...job!, articles: updated })
                                                                    }}
                                                                    className={`
                                                                        w-5 h-5 rounded border flex items-center justify-center transition-all
                                                                        ${isIncluded
                                                                            ? 'bg-acid border-acid text-void'
                                                                            : 'bg-white border-ash/30 hover:border-acid'}
                                                                    `}
                                                                >
                                                                    {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                                                                </button>
                                                            </td>
                                                        )
                                                    case 'title':
                                                        return (
                                                            <td key={col.id} className="p-4 max-w-xl">
                                                                <div className="flex flex-col gap-1">
                                                                    <a
                                                                        href={article.url || `https://pubmed.ncbi.nlm.nih.gov/${article.id}/`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`
                                                                            font-medium text-base hover:text-acid hover:underline decoration-1 underline-offset-4
                                                                            ${isIncluded ? 'text-steel' : 'text-steel'}
                                                                        `}
                                                                    >
                                                                        {article.title}
                                                                        <ExternalLink className="w-3 h-3 inline ml-1 opacity-30" />
                                                                    </a>
                                                                    <div className="text-xs text-steel-dim/80 truncate">
                                                                        {article.authors?.slice(0, 3).join(', ')} {article.authors?.length > 3 && `+${article.authors.length - 3} others`}
                                                                    </div>
                                                                    {article.abstract && (
                                                                        <details className="mt-1 group/details">
                                                                            <summary className="text-[10px] font-bold text-steel-dim/60 cursor-pointer uppercase tracking-wider hover:text-acid select-none flex items-center gap-1">
                                                                                Show Abstract
                                                                            </summary>
                                                                            <p className="mt-2 text-steel-dim text-xs leading-relaxed p-3 bg-zinc-50 rounded border border-ash/10">
                                                                                {article.abstract}
                                                                            </p>
                                                                        </details>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )
                                                    case 'year':
                                                        return <td key={col.id} className="p-4 text-steel-dim font-mono">{article.year}</td>
                                                    case 'source':
                                                        return (
                                                            <td key={col.id} className="p-4">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-steel-dim border border-ash/20 uppercase tracking-tight">
                                                                    {article.source}
                                                                </span>
                                                            </td>
                                                        )
                                                    case 'if':
                                                        return (
                                                            <td key={col.id} className="p-4 text-steel-dim font-mono text-xs">
                                                                {article.impactFactor ? article.impactFactor.toFixed(1) : '-'}
                                                            </td>
                                                        )
                                                    case 'citations':
                                                        return (
                                                            <td key={col.id} className="p-4 text-steel-dim font-mono text-xs">
                                                                {article.citations ? article.citations.length : '-'}
                                                            </td>
                                                        )
                                                    case 'status':
                                                        return (
                                                            <td key={col.id} className="p-4">
                                                                {!isExcluded ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            const updated = job!.articles!.map(a => a.id === article.id ? { ...a, screeningStatus: 'excluded' as const } : a)
                                                                            setJob({ ...job!, articles: updated })
                                                                        }}
                                                                        className="p-1.5 rounded-md hover:bg-red-50 text-steel-dim hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                                                                        title="Exclude"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            const updated = job!.articles!.map(a => a.id === article.id ? { ...a, screeningStatus: 'pending' as const } : a)
                                                                            setJob({ ...job!, articles: updated })
                                                                        }}
                                                                        className="p-1.5 rounded-md hover:bg-zinc-100 text-red-500 hover:text-steel transition-colors border border-red-100 hover:border-ash/20"
                                                                        title="Restore"
                                                                    >
                                                                        <RotateCcw className="w-4 h-4" />
                                                                    </button>
                                                                )}
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

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-ash/10 bg-zinc-50 flex items-center justify-between sticky bottom-0 z-20">
                        <div className="text-xs text-steel-dim">
                            Showing <span className="font-medium text-steel">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-steel">{Math.min(currentPage * pageSize, processedArticles.length)}</span> of <span className="font-medium text-steel">{processedArticles.length}</span> results
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Simple pagination window logic
                                    let pageNum = i + 1
                                    if (totalPages > 5 && currentPage > 3) {
                                        pageNum = currentPage - 3 + i
                                    }
                                    if (pageNum > totalPages) return null

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`
                                                w-7 h-7 rounded text-xs font-medium transition-all
                                                ${currentPage === pageNum
                                                    ? 'bg-acid text-void shadow-sm'
                                                    : 'hover:bg-zinc-200 text-steel-dim'}
                                            `}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Actions */}
            {job?.status === 'completed' && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={async () => {
                            setActionLoading(true);
                            const includedIds = job.articles!.filter(a => a.screeningStatus === 'included').map(a => a.id)
                            const excludedIds = job.articles!.filter(a => a.screeningStatus === 'excluded').map(a => a.id)
                            try {
                                const response = await fetch(`/api/research/jobs/${id}/screening`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ includedIds, excludedIds })
                                })
                                if (response.ok) {
                                    handleTransition()
                                } else {
                                    addToast(t('papers.save_error'), 'error')
                                }
                            } catch (e) {
                                console.error(e)
                                addToast(t('papers.network_error'), 'error')
                            } finally {
                                setActionLoading(false)
                            }
                        }}
                        disabled={actionLoading || !job.articles?.some(a => a.screeningStatus === 'included')}
                        className={`
                            shadow-2xl border-2 border-void
                            ${!job.articles?.some(a => a.screeningStatus === 'included') && 'opacity-50 cursor-not-allowed'}
                        `}
                    >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        {actionLoading ? t('papers.saving') : `Continue with ${job.articles?.filter(a => a.screeningStatus === 'included').length} Selected`}
                    </Button>
                </div>
            )}
        </div>
    )
}
