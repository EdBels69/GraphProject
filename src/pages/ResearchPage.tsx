import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Loader2, CheckCircle, XCircle, Clock, FileText, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

interface ResearchJob {
    id: string
    topic: string
    status: 'pending' | 'searching' | 'downloading' | 'analyzing' | 'completed' | 'failed' | 'cancelled'
    progress: number
    articlesFound: number
    articlesProcessed: number
    articles?: {
        title: string
        doi?: string
        authors?: string[]
        year?: number
        pdfUrl?: string
        status: string
    }[]
    graphId?: string
    reviewText?: string
    error?: string
    createdAt: string
    completedAt?: string
}

export default function ResearchPage() {
    const navigate = useNavigate()
    const [topic, setTopic] = useState('')
    const [maxArticles, setMaxArticles] = useState(50)
    const [yearFrom, setYearFrom] = useState<number>(new Date().getFullYear() - 10)
    const [yearTo, setYearTo] = useState<number>(new Date().getFullYear())
    const [sources, setSources] = useState<string[]>(['pubmed', 'crossref'])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [jobs, setJobs] = useState<ResearchJob[]>([])
    const [error, setError] = useState<string | null>(null)

    // Fetch jobs on mount and periodically
    useEffect(() => {
        fetchJobs()
        const interval = setInterval(fetchJobs, 3000)
        return () => clearInterval(interval)
    }, [])

    const fetchJobs = async () => {
        try {
            const response = await fetch('/api/research/jobs')
            if (response.ok) {
                const data = await response.json()
                setJobs(data.jobs || [])
            }
        } catch (err) {
            console.error('Failed to fetch jobs:', err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topic.trim()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/research/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    maxArticles,
                    sources,
                    yearFrom,
                    yearTo,
                    generateReview: true
                })
            })

            if (!response.ok) {
                throw new Error('Не удалось запустить исследование')
            }

            setTopic('')
            fetchJobs()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusIcon = (status: ResearchJob['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'failed':
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'pending':
                return <Clock className="w-5 h-5 text-gray-400" />
            default:
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        }
    }

    const getStatusText = (status: ResearchJob['status']) => {
        const texts: Record<string, string> = {
            pending: 'Ожидание',
            searching: 'Поиск статей...',
            downloading: 'Загрузка PDF...',
            analyzing: 'Анализ текстов...',
            completed: 'Завершено',
            failed: 'Ошибка',
            cancelled: 'Отменено'
        }
        return texts[status] || status
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
                    <h1 className="text-3xl font-bold text-steel">Автоматический сбор литературы</h1>
                    <p className="text-steel-dim font-bold">
                        Введите тему — AI-агент найдет статьи, проверит доступ к PDF и построит граф знаний
                    </p>
                </div>
            </div>

            {/* New Research Form */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Новое исследование</h2>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Тема исследования
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Например: metformin aging mechanisms"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-steel-dim mb-1 uppercase tracking-tight">
                                    Макс. статей
                                </label>
                                <select
                                    value={maxArticles}
                                    onChange={(e) => setMaxArticles(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-ash/30 rounded-lg bg-white text-steel focus:ring-2 focus:ring-acid/20 focus:border-acid"
                                    disabled={isSubmitting}
                                >
                                    <option value={20}>20 статей</option>
                                    <option value={50}>50 статей</option>
                                    <option value={100}>100 статей</option>
                                    <option value={500}>500 статей</option>
                                    <option value={1000}>1000 статей (Макс)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-steel-dim mb-1 uppercase tracking-tight">
                                    Период поиска
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={yearFrom}
                                        onChange={(e) => setYearFrom(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-ash/30 rounded-lg bg-white text-steel focus:ring-2 focus:ring-acid/20 focus:border-acid"
                                        placeholder="От"
                                        disabled={isSubmitting}
                                    />
                                    <span className="text-steel-dim">—</span>
                                    <input
                                        type="number"
                                        value={yearTo}
                                        onChange={(e) => setYearTo(Number(e.target.value))}
                                        className="w-full px-3 py-2 border border-ash/30 rounded-lg bg-white text-steel focus:ring-2 focus:ring-acid/20 focus:border-acid"
                                        placeholder="До"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-steel-dim mb-1 uppercase tracking-tight">
                                    Источники данных
                                </label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {['pubmed', 'crossref', 'arxiv'].map(source => (
                                        <label key={source} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sources.includes(source)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSources([...sources, source])
                                                    else setSources(sources.filter(s => s !== source))
                                                }}
                                                className="rounded border-ash/30 text-acid focus:ring-acid"
                                                disabled={isSubmitting}
                                            />
                                            <span className="text-xs font-bold text-steel uppercase tracking-tighter">{source}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-void border border-ash/10 rounded-xl space-y-2">
                            <h3 className="text-xs font-bold text-steel uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3 text-acid" /> Методология поиска
                            </h3>
                            <p className="text-[10px] text-steel-dim leading-relaxed font-medium">
                                1. AI-агент переводит вашу тему в серию оптимизированных поисковых запросов. <br />
                                2. Происходит параллельный поиск по выбранным базам данных (PubMed, CrossRef). <br />
                                3. Система отсеивает дубликаты и ищет Open Access PDF через Unpaywall. <br />
                                4. Только доступные статьи проходят через конвейер извлечения сущностей и связей.
                            </p>
                        </div>

                        <Button type="submit" disabled={!topic.trim() || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Запуск...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4 mr-2" />
                                    Начать исследование
                                </>
                            )}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                </form>
            </CardBody>
        </Card>

            {/* Jobs List */ }
    <Card>
        <CardHeader>
            <h2 className="text-lg font-semibold">История исследований</h2>
        </CardHeader>
        <CardBody>
            {jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Пока нет запущенных исследований</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                {getStatusIcon(job.status)}
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{job.topic}</h3>
                                    <p className="text-sm text-gray-500">
                                        {getStatusText(job.status)}
                                        {job.articlesFound > 0 && ` • Найдено: ${job.articlesFound}`}
                                        {job.articlesProcessed > 0 && ` • Обработано: ${job.articlesProcessed}`}
                                    </p>

                                    {/* Progress bar */}
                                    {['searching', 'downloading', 'analyzing'].includes(job.status) && (
                                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${job.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {job.error && (
                                        <p className="text-sm text-red-600 mt-1">{job.error}</p>
                                    )}
                                </div>

                                {job.status === 'completed' && job.graphId && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => navigate(`/analysis?graphId=${job.graphId}`)}
                                    >
                                        <Activity className="w-4 h-4 mr-1" />
                                        Граф
                                    </Button>
                                )}
                            </div>

                            {/* Review text preview */}
                            {job.reviewText && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                    <p className="font-medium mb-1">Обзор литературы:</p>
                                    <p className="line-clamp-3">{job.reviewText}</p>
                                </div>
                            )}
                            {/* Articles List */}
                            {job.articles && job.articles.length > 0 && (
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    <details className="group">
                                        <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
                                            <span>Показать список статей ({job.articles.length})</span>
                                            <span className="group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="mt-2 pl-2 space-y-2 max-h-60 overflow-y-auto">
                                            {job.articles.map((article, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <div className="font-medium text-gray-800">
                                                        <a
                                                            href={article.pdfUrl || (article.doi ? `https://doi.org/${article.doi}` : '#')}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-blue-600 hover:underline"
                                                        >
                                                            {article.title}
                                                        </a>
                                                    </div>
                                                    <div className="text-gray-500 text-xs">
                                                        {article.authors?.slice(0, 3).join(', ')} ({article.year})
                                                        {article.status === 'processed' && (
                                                            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]">
                                                                Processed
                                                            </span>
                                                        )}
                                                        {article.pdfUrl && (
                                                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                                                                PDF
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </CardBody>
    </Card>
        </div >
    )
}
