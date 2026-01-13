
import { ArrowUp, ArrowDown, ArrowUpDown, Check, X, RotateCcw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ArticleSource as Article } from '../../../shared/contracts/research'
import { SortDirection } from '../../hooks/useArticleFilters'

interface Props {
    articles: Article[]
    loading: boolean
    columns: any[]
    sortConfig: { key: keyof Article; direction: SortDirection }
    onSort: (key: any) => void
    onUpdateStatus: (articleId: string, status: 'included' | 'excluded' | 'pending') => void
    currentPage: number
    totalPages: number
    setCurrentPage: (page: number) => void
    processedCount: number
    startIndex: number
}

export function ArticleTable({
    articles, loading, columns, sortConfig, onSort, onUpdateStatus,
    currentPage, totalPages, setCurrentPage, processedCount, startIndex
}: Props) {

    if (!articles || articles.length === 0) {
        return <div className="p-8 text-center text-steel-dim">No articles found matching your criteria.</div>
    }

    return (
        <>
            <div className="overflow-x-auto min-h-[600px]">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 sticky top-[65px] z-10 shadow-sm">
                        <tr>
                            {columns.map((col: any) => (
                                <th
                                    key={col.id}
                                    onClick={() => col.sortable && onSort(col.id as any)}
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
                        {articles.map((article) => {
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
                                    {columns.map((col: any) => {
                                        switch (col.id) {
                                            case 'checkbox':
                                                return (
                                                    <td key={col.id} className="p-4 text-center">
                                                        <button
                                                            onClick={() => onUpdateStatus(article.id, isIncluded ? 'pending' : 'included')}
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
                                                                {article.authors?.slice(0, 3).join(', ')} {(article.authors?.length || 0) > 3 && `+${(article.authors?.length || 0) - 3} others`}
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
                                                        {article.citations || '-'}
                                                    </td>
                                                )
                                            case 'status':
                                                return (
                                                    <td key={col.id} className="p-4">
                                                        {!isExcluded ? (
                                                            <button
                                                                onClick={() => onUpdateStatus(article.id, 'excluded')}
                                                                className="p-1.5 rounded-md hover:bg-red-50 text-steel-dim hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                                                                title="Exclude"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => onUpdateStatus(article.id, 'pending')}
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

            {/* Pagination */}
            <div className="p-4 border-t border-ash/10 bg-zinc-50 flex items-center justify-between sticky bottom-0 z-20">
                <div className="text-xs text-steel-dim">
                    Showing <span className="font-medium text-steel">{startIndex + 1}</span> to <span className="font-medium text-steel">{startIndex + articles.length}</span> of <span className="font-medium text-steel">{processedCount}</span> results
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1 mx-2">
                        <span className="text-xs text-steel-dim">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </>
    )
}
