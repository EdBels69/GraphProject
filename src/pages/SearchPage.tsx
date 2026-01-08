import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { AdvancedSearchFilters } from '@/components/AdvancedSearchFilters'

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
    const [results, setResults] = useState<SearchResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (filters: SearchFilters) => {
        setIsLoading(true)
        setError(null)
        setHasSearched(true)

        try {
            const params = new URLSearchParams({
                q: filters.query,
                sources: filters.sources.join(','),
                sortBy: filters.sortBy,
                maxResults: '20'
            })

            if (filters.yearFrom) params.append('yearFrom', filters.yearFrom.toString())
            if (filters.yearTo) params.append('yearTo', filters.yearTo.toString())
            if (filters.authors) params.append('q', `${filters.query} ${filters.authors}`)

            const response = await fetch(`/api/search?${params}`)

            if (!response.ok) {
                throw new Error('Ошибка поиска')
            }

            const data = await response.json()
            setResults(data.results || data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка')
        } finally {
            setIsLoading(false)
        }
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
                    <h1 className="text-3xl font-bold text-gray-900">Поиск статей</h1>
                    <p className="text-gray-600">Поиск по PubMed, CrossRef, Google Scholar и arXiv</p>
                </div>
            </div>

            {/* Search Filters */}
            <Card>
                <CardBody>
                    <AdvancedSearchFilters onSearch={handleSearch} isLoading={isLoading} />
                </CardBody>
            </Card>

            {/* Results */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-3 text-gray-600">Поиск...</span>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {!isLoading && hasSearched && results.length === 0 && !error && (
                <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Статьи не найдены. Попробуйте изменить параметры поиска.</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Найдено: {results.length} статей</p>

                    {results.map((result) => (
                        <Card key={result.id} className="hover:shadow-md transition-shadow">
                            <CardBody>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 mb-1">{result.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {result.authors?.slice(0, 3).join(', ')}
                                            {result.authors?.length > 3 && ' и др.'}
                                            {result.year && ` • ${result.year}`}
                                        </p>
                                        {result.abstract && (
                                            <p className="text-sm text-gray-500 line-clamp-2">{result.abstract}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                {result.source}
                                            </span>
                                            {result.citations !== undefined && (
                                                <span className="text-xs text-gray-500">
                                                    {result.citations} цитирований
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
                                            <Button variant="ghost" size="sm">
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
