
import { useState, useMemo } from 'react'
import { ArticleSource as Article } from '../../shared/contracts/research'
import { useTranslation } from 'react-i18next'

export type SortDirection = 'asc' | 'desc'
export type ScreeningFilter = 'all' | 'included' | 'excluded' | 'pending'

interface FilterState {
    status: ScreeningFilter
    year: { min: string; max: string }
    source: string
}

export function useArticleFilters(articles: Article[] = []) {
    const { t } = useTranslation()

    // State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)
    const [sortConfig, setSortConfig] = useState<{ key: keyof Article; direction: SortDirection }>({
        key: 'year',
        direction: 'desc'
    })

    const [filters, setFilters] = useState<FilterState>({
        status: 'all',
        year: { min: '', max: '' },
        source: 'all'
    })

    // Column Config (Keep it here or pass from component)
    const columns = useMemo(() => [
        { id: 'checkbox', label: '', width: 48, sortable: false },
        { id: 'title', label: t('papers.col_title'), sortable: true },
        { id: 'year', label: t('papers.col_year'), width: 100, sortable: true },
        { id: 'source', label: t('papers.col_source'), width: 120, sortable: true },
        { id: 'if', label: 'IF', width: 80, sortable: true },
        { id: 'citations', label: 'Cit.', width: 80, sortable: false },
        { id: 'status', label: t('papers.col_status'), width: 120, sortable: false }
    ], [t])

    // Filtering & Sorting
    const processedArticles = useMemo(() => {
        if (!articles) return []

        let filtered = articles.filter(article => {
            // Status Filter
            if (filters.status !== 'all') {
                if (filters.status === 'pending') {
                    if (article.screeningStatus && article.screeningStatus !== 'pending') return false
                } else {
                    if (article.screeningStatus !== filters.status) return false
                }
            }

            // Source Filter
            if (filters.source !== 'all') {
                if (article.source !== filters.source) return false
            }

            // Year Filter
            if (filters.year.min) {
                if (!article.year || article.year < parseInt(filters.year.min)) return false
            }
            if (filters.year.max) {
                if (!article.year || article.year > parseInt(filters.year.max)) return false
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
    }, [articles, filters, sortConfig])

    // Pagination
    const totalPages = Math.ceil(processedArticles.length / pageSize)
    const paginatedArticles = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return processedArticles.slice(start, start + pageSize)
    }, [processedArticles, currentPage, pageSize])

    // Handlers
    const handleSort = (key: keyof Article) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const setFilter = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1) // Reset page on filter change
    }

    return {
        // State
        currentPage,
        pageSize,
        sortConfig,
        filters,
        columns,

        // Computed
        processedArticles,
        paginatedArticles,
        totalPages,

        // Actions
        setCurrentPage,
        setPageSize,
        handleSort,
        setFilter
    }
}
