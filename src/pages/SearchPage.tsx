import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CardBody } from '@/components/ui/Card'
import { AdvancedSearchFilters } from '@/components/AdvancedSearchFilters'
import { useApiLazy } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'

interface SearchResult {
    id: string
    title: string
    authors: string[]
    year: number
    abstract?: string
    doi?: string
    url?: string
    source: string
    citations?: number
}

interface SearchFilters {
    query: string
    yearFrom?: number
    yearTo?: number
    authors?: string
    sortBy: 'relevance' | 'date' | 'citations'
    sources: string[]
}

export default function SearchPage() {
    const [hasSearched, setHasSearched] = useState(false)

    const { data, loading: isLoading, error, trigger } = useApiLazy<SearchResult[]>((params: URLSearchParams) =>
        `${API_ENDPOINTS.AI.BASE}/search?${params.toString()}`
    )

    const results = data || []

    const handleSearch = async (filters: SearchFilters) => {
        setHasSearched(true)

        const params = new URLSearchParams({
            q: filters.query,
            sources: filters.sources.join(','),
            sortBy: filters.sortBy,
            maxResults: '20'
        })

        if (filters.yearFrom) params.append('yearFrom', filters.yearFrom.toString())
        if (filters.yearTo) params.append('yearTo', filters.yearTo.toString())
        if (filters.authors) params.append('q', `${filters.query} ${filters.authors}`)

        await trigger(params)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Назад
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">ГЛОБАЛЬНЫЙ_ПОИСК_ЛИТЕРАТУРЫ</h1>
                    <p className="text-slate-400 font-mono text-sm">ПОИСКОВЫЕ СИСТЕМЫ: PUBMED, CROSSREF, ARCHIVE, UNPAYWALL</p>
                </div>
            </div>

            {/* Search Filters */}
            <Card variant="glass" className="border-cyan-500/20">
                <CardBody>
                    <AdvancedSearchFilters onSearch={handleSearch} isLoading={isLoading} />
                </CardBody>
            </Card>

            {/* Results */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                    <span className="text-cyan-500/80 font-mono animate-pulse">ЗАПУСК МЕЖБАЗОВОГО ПОИСКА...</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 font-mono text-sm">
                    ОШИБКА ПРОТОКОЛА: {error}
                </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && !error && (
                <div className="text-center py-20 text-slate-500 space-y-4">
                    <BookOpen className="w-16 h-16 mx-auto opacity-20" />
                    <p className="font-mono">СОВПАДЕНИЙ НЕ НАЙДЕНО</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-4">
                    <p className="text-sm font-mono text-cyan-500/60 uppercase tracking-widest">НАЙДЕНО СОВПАДЕНИЙ: {results.length}</p>

                    {results.map((result) => (
                        <Card key={result.id} variant="glass" className="hover:border-cyan-500/30 transition-all duration-300 group">
                            <CardBody>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                        <h3 className="font-display font-bold text-white tracking-widest leading-snug group-hover:text-cyan-400 transition-colors">
                                            {result.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-steel/50 uppercase">
                                            <span className="text-slate-200">
                                                {result.authors?.slice(0, 3).join(', ')}
                                                {result.authors?.length > 3 && ' И ДР.'}
                                            </span>
                                            {result.year && (
                                                <>
                                                    <span className="opacity-30">|</span>
                                                    <span className="text-cyan-500/70">ГОД: {result.year}</span>
                                                </>
                                            )}
                                        </div>

                                        {result.abstract && (
                                            <p className="text-xs text-steel/40 leading-relaxed line-clamp-2 italic font-light">
                                                {result.abstract}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 pt-1">
                                            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[10px] font-mono font-bold rounded uppercase tracking-tighter">
                                                ИСТОЧНИК: {result.source}
                                            </span>

                                            {result.citations !== undefined && (
                                                <span className="text-[10px] font-mono text-steel/40 uppercase tracking-tighter">
                                                    ЦИТИРОВАНИЯ: {result.citations}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {result.url && (
                                        <a
                                            href={result.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0"
                                        >
                                            <Button variant="ghost" size="sm" className="hover:bg-cyan-500/10 text-cyan-500">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
