
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useResearchJob } from '@/hooks/useResearchJob'
import { useArticleFilters } from '@/hooks/useArticleFilters'
import { ResearchHeader } from '@/components/research/ResearchHeader'
import { ArticleFiltersToolbar } from '@/components/research/ArticleFiltersToolbar'
import { ArticleTable } from '@/components/research/ArticleTable'
import { ScreeningFloatingBar } from '@/components/research/ScreeningFloatingBar'

export default function PapersPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { job, setJob, isLoading } = useResearchJob(id)
    const [isDirty, setIsDirty] = useState(false)

    // Warn on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

    // Filter Hook
    const {
        currentPage, pageSize, sortConfig, filters, columns,
        paginatedArticles, totalPages, processedArticles,
        setCurrentPage, setPageSize, handleSort, setFilter
    } = useArticleFilters(job?.articles || [])

    const handleUpdateStatus = (articleId: string, status: 'included' | 'excluded' | 'pending') => {
        if (!job?.articles) return
        const updated = job.articles.map((a: any) => a.id === articleId ? { ...a, screeningStatus: status } : a)
        setJob({ ...job, articles: updated })
        setIsDirty(true)
    }

    const handleBulkStatus = (status: 'included' | 'excluded') => {
        if (!job?.articles) return
        const updated = job.articles.map((a: any) => ({ ...a, screeningStatus: status }))
        setJob({ ...job, articles: updated })
        setIsDirty(true)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-void">
                <Loader2 className="w-12 h-12 text-acid animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-32 animate-fade-in text-steel relative">

            <ResearchHeader job={job} />

            {job?.articles && (
                <div className="bg-white rounded-xl shadow-sm border border-ash/20 overflow-hidden">
                    <ArticleFiltersToolbar
                        currentFilter={filters.status}
                        setFilter={setFilter}
                        sourceFilter={filters.source}
                        yearFilter={filters.year}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        onIncludeAll={() => handleBulkStatus('included')}
                        onExcludeAll={() => handleBulkStatus('excluded')}
                        jobId={job.id}
                    />

                    <ArticleTable
                        articles={paginatedArticles}
                        loading={false}
                        columns={columns}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        onUpdateStatus={handleUpdateStatus}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        setCurrentPage={setCurrentPage}
                        processedCount={processedArticles.length}
                        startIndex={(currentPage - 1) * pageSize}
                    />
                </div>
            )}

            {job && (
                <ScreeningFloatingBar
                    job={job}
                    onSaveSuccess={() => {
                        setIsDirty(false)
                        if (job.graphId) navigate(`/research/${id}/graph`)
                        else navigate(`/research/${id}/config`)
                    }}
                />
            )}
        </div>
    )
}
