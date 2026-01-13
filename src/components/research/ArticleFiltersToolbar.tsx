
import { Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { ScreeningFilter } from '../../hooks/useArticleFilters'

interface Props {
    currentFilter: ScreeningFilter
    setFilter: (key: any, value: any) => void
    sourceFilter: string
    yearFilter: { min: string; max: string }
    pageSize: number
    setPageSize: (size: number) => void
    onIncludeAll: () => void
    onExcludeAll: () => void
    jobId: string
}

export function ArticleFiltersToolbar({
    currentFilter, setFilter, sourceFilter, yearFilter,
    pageSize, setPageSize, onIncludeAll, onExcludeAll, jobId
}: Props) {
    const { t } = useTranslation()

    return (
        <>
            {/* Filter Tabs */}
            <div className="flex p-1 bg-zinc-100 rounded-lg border border-ash/40 mb-4 w-fit">
                {(['all', 'pending', 'included', 'excluded'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter('status', f)}
                        className={`
                          px-4 py-2 rounded-md text-sm font-semibold transition-all
                          ${currentFilter === f ? 'bg-white text-acid shadow-sm border border-ash/20' : 'text-steel-dim hover:text-steel'}
                        `}
                    >
                        {f === 'all' ? t('papers.filter_all') : f === 'pending' ? t('papers.filter_pending') : f === 'included' ? t('papers.filter_included') : t('papers.filter_excluded')}
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-ash/10 bg-zinc-50 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-20">
                <div className="flex gap-2 items-center">
                    <span className="text-xs font-semibold text-steel-dim uppercase tracking-wider mr-2">
                        Bulk Actions:
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onIncludeAll}
                        className="text-xs h-8 bg-white"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Include All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExcludeAll}
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
                            onChange={(e) => setFilter('source', e.target.value)}
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
                            onChange={(e) => setFilter('year', { ...yearFilter, min: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-ash/30 rounded bg-white focus:ring-1 focus:ring-acid outline-none"
                        />
                        <span className="text-ash">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={yearFilter.max}
                            onChange={(e) => setFilter('year', { ...yearFilter, max: e.target.value })}
                            className="w-16 px-2 py-1 text-xs border border-ash/30 rounded bg-white focus:ring-1 focus:ring-acid outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 mr-4 text-sm text-steel-dim">
                        <span>Show:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="bg-white border border-ash/30 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-acid outline-none"
                        >
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    <a href={`/api/research/jobs/${jobId}/export/csv`} className="px-3 py-1.5 bg-white border border-ash/30 text-steel-dim hover:text-steel rounded-md text-xs font-medium flex items-center gap-2 transition-all">
                        <Download className="w-3.5 h-3.5" /> CSV
                    </a>
                    <a href={`/api/research/jobs/${jobId}/export/bibtex`} className="px-3 py-1.5 bg-white border border-ash/30 text-steel-dim hover:text-steel rounded-md text-xs flex items-center gap-2 transition-all font-medium">
                        <FileText className="w-3.5 h-3.5" /> BibTeX
                    </a>
                </div>
            </div>
        </>
    )
}
