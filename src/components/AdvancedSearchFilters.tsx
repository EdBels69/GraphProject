import { useState } from 'react'
import { Search, Filter, X, Calendar, User, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SearchFilters {
    query: string
    yearFrom?: number
    yearTo?: number
    authors?: string
    sortBy: 'relevance' | 'date' | 'citations'
    sources: string[]
}

interface AdvancedSearchFiltersProps {
    onSearch: (filters: SearchFilters) => void
    isLoading?: boolean
}

export function AdvancedSearchFilters({ onSearch, isLoading }: AdvancedSearchFiltersProps) {
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        sortBy: 'relevance',
        sources: ['pubmed', 'crossref']
    })

    const currentYear = new Date().getFullYear()

    const handleSearch = () => {
        if (filters.query.trim()) {
            onSearch(filters)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const clearFilters = () => {
        setFilters({
            query: filters.query,
            sortBy: 'relevance',
            sources: ['pubmed', 'crossref']
        })
    }

    return (
        <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={filters.query}
                        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                        onKeyDown={handleKeyDown}
                        placeholder="Введите поисковый запрос..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-blue-100' : ''}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Фильтры
                </Button>
                <Button onClick={handleSearch} disabled={isLoading || !filters.query.trim()}>
                    <Search className="w-4 h-4 mr-2" />
                    Поиск
                </Button>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">Расширенные фильтры</h3>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="w-4 h-4 mr-1" />
                            Сбросить
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Year Range */}
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-steel-dim uppercase tracking-widest mb-2">
                                <Calendar className="w-3 h-3 text-cyan-500" />
                                Диапазон лет
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="ОТ"
                                        min={1900}
                                        max={currentYear}
                                        value={filters.yearFrom || ''}
                                        onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full pl-3 pr-2 py-2 bg-void border border-ash/20 rounded text-steel font-mono text-xs focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                    />
                                </div>
                                <span className="text-ash/30">—</span>
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        placeholder="ДО"
                                        min={1900}
                                        max={currentYear}
                                        value={filters.yearTo || ''}
                                        onChange={(e) => setFilters({ ...filters, yearTo: e.target.value ? parseInt(e.target.value) : undefined })}
                                        className="w-full pl-3 pr-2 py-2 bg-void border border-ash/20 rounded text-steel font-mono text-xs focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Authors */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4" />
                                Авторы
                            </label>
                            <input
                                type="text"
                                placeholder="Фамилия автора"
                                value={filters.authors || ''}
                                onChange={(e) => setFilters({ ...filters, authors: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <SortAsc className="w-4 h-4" />
                                Сортировка
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="relevance">По релевантности</option>
                                <option value="date">По дате</option>
                                <option value="citations">По цитированиям</option>
                            </select>
                        </div>
                    </div>

                    {/* Sources */}
                    <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Источники</label>
                        <div className="flex flex-wrap gap-2">
                            {['pubmed', 'crossref', 'scholar', 'arxiv'].map((source) => (
                                <label
                                    key={source}
                                    className={`
                    px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors
                    ${filters.sources.includes(source)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }
                  `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.sources.includes(source)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFilters({ ...filters, sources: [...filters.sources, source] })
                                            } else {
                                                setFilters({ ...filters, sources: filters.sources.filter(s => s !== source) })
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    {source.charAt(0).toUpperCase() + source.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
