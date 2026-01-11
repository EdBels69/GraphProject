import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, CheckCircle, XCircle, Clock, FileText, Activity, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ResearchJob {
    id: string
    topic: string
    status: 'pending' | 'searching' | 'downloading' | 'analyzing' | 'completed' | 'failed' | 'cancelled'
    progress: number
    articlesFound: number
    articlesProcessed: number
    graphId?: string
    reviewText?: string
    error?: string
    createdAt: string
}

export default function ResearchPage() {
    const navigate = useNavigate()
    const [filterQuery, setFilterQuery] = useState('')
    const [jobs, setJobs] = useState<ResearchJob[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchJobs()
        const interval = setInterval(fetchJobs, 5000)
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
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: ResearchJob['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-acid shadow-glow-acid/20" />
            case 'failed':
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />
            case 'pending':
                return <Clock className="w-5 h-5 text-steel-dim/50" />
            default:
                return <Loader2 className="w-5 h-5 text-plasma animate-spin" />
        }
    }

    const getStatusText = (status: ResearchJob['status']) => {
        const texts: Record<string, string> = {
            pending: 'Ожидание',
            searching: 'Поиск статей...',
            downloading: 'Загрузка PDF...',
            analyzing: 'Анализ текстов...',
            completed: 'Завершен',
            failed: 'Ошибка',
            cancelled: 'Отменен'
        }
        return texts[status] || status
    }

    const filteredJobs = jobs.filter(j => {
        const query = filterQuery.toLowerCase().trim()
        if (!query) return true
        return (j.topic || '').toLowerCase().includes(query)
    })

    if (loading && jobs.length === 0) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-acid animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ash/10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-acid text-[10px] font-bold tracking-[0.3em] uppercase">
                        <Activity className="w-3 h-3" />
                        ЦЕНТР УПРАВЛЕНИЯ ПРОЕКТАМИ
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-steel tracking-tighter">
                        АРХИВ <span className="text-steel/40 font-light italic">CORTEX</span>
                    </h1>
                    <p className="text-steel-dim text-sm max-w-lg font-medium leading-relaxed">
                        Ваша персональная библиотека исследований. Управление графами знаний и аналитическими отчетами.
                    </p>
                </div>

                <div className="relative group w-full md:w-96">
                    <div className="absolute inset-0 bg-acid/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-dim group-focus-within:text-acid transition-colors" />
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder="Поиск по названию исследования..."
                        className="w-full pl-12 pr-4 py-4 bg-void border border-ash/20 rounded-2xl text-steel text-sm focus:outline-none focus:border-acid/50 transition-all placeholder:text-steel-dim/40 shadow-sm"
                    />
                </div>
            </div>

            {/* Project List */}
            <div className="grid grid-cols-1 gap-6">
                {filteredJobs.length === 0 ? (
                    <div className="glass-panel rounded-[2rem] p-24 text-center space-y-6 border-dashed border-2 border-ash/10 bg-void/30">
                        <div className="w-20 h-20 bg-void border border-ash/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <FileText className="w-8 h-8 text-steel-dim/30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-display font-bold text-steel tracking-wide">АРХИВ ПУСТ</h3>
                            <p className="text-steel-dim text-xs uppercase tracking-[0.2em] font-medium">
                                {filterQuery ? 'Нет соответствий параметрам фильтра' : 'Начните свое первое исследование на главной'}
                            </p>
                        </div>
                        {!filterQuery && (
                            <Button variant="primary" size="lg" onClick={() => navigate('/')} className="px-10 shadow-glow-acid/20">
                                <Activity className="w-4 h-4 mr-2" />
                                ЗАПУСТИТЬ СИНТЕЗ
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="glass-panel rounded-3xl p-8 hover:border-acid/40 transition-all duration-500 group relative overflow-hidden bg-void/40 backdrop-blur-xl"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-acid/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-start gap-6 flex-1 min-w-0">
                                    <div className="mt-1.5 p-3 rounded-2xl bg-void border border-ash/10 group-hover:border-acid/30 transition-colors shadow-sm">
                                        {getStatusIcon(job.status)}
                                    </div>
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-display font-bold text-steel group-hover:text-acid transition-colors tracking-tight truncate">
                                                {job.topic}
                                            </h3>
                                            {job.status === 'completed' && (
                                                <div className="px-2 py-0.5 rounded-full bg-acid/10 border border-acid/20 text-[9px] font-bold text-acid uppercase tracking-tighter">
                                                    READY
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-mono text-steel-dim uppercase tracking-[0.1em] font-bold">
                                            <span className="flex items-center gap-2 py-1 px-3 rounded-lg bg-ash/5">
                                                <Clock className="w-3 h-3 text-acid" />
                                                ID: {job.id.slice(0, 8)} • {new Date(job.createdAt).toLocaleDateString('ru-RU')}
                                            </span>
                                            <span className="flex items-center gap-2 py-1 px-3 rounded-lg bg-ash/5">
                                                <FileText className="w-3 h-3 text-plasma" />
                                                {job.articlesFound || 0} ИСТОЧНИКОВ
                                            </span>
                                            <div className="flex items-center gap-2 text-steel">
                                                <div className={`w-1.5 h-1.5 rounded-full ${job.status === 'completed' ? 'bg-acid shadow-glow-acid' : 'bg-plasma animate-pulse'}`} />
                                                {getStatusText(job.status)}
                                            </div>
                                        </div>

                                        {job.reviewText && (
                                            <p className="text-xs text-steel-dim/60 line-clamp-2 mt-3 font-medium leading-relaxed max-w-3xl italic">
                                                {job.reviewText}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() => navigate(`/research/${job.id}/papers`)}
                                        className="rounded-2xl border-ash/20 hover:border-steel px-6"
                                    >
                                        ОТКРЫТЬ
                                    </Button>

                                    {job.status === 'completed' && job.graphId && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={() => navigate(`/research/${job.id}/graph`)}
                                            className="rounded-2xl shadow-glow-acid/10 px-6 group/btn"
                                        >
                                            <Activity className="w-4 h-4 mr-2 group-hover/btn:animate-pulse" />
                                            ГРАФ
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Active Progress Visualization */}
                            {['searching', 'downloading', 'analyzing'].includes(job.status) && (
                                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-ash/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-plasma to-acid shadow-glow-plasma transition-all duration-1000 ease-out"
                                        style={{ width: `${job.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
