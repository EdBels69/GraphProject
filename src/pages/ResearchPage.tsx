import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2, CheckCircle, XCircle, Clock, FileText, Activity, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { useSocket } from '@/hooks/useSocket'

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
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [filterQuery, setFilterQuery] = useState('')
    const [jobs, setJobs] = useState<ResearchJob[]>([])
    const [loading, setLoading] = useState(true)

    const { socket, isConnected, joinJob, leaveJob } = useSocket()

    useEffect(() => {
        fetchJobs()
        const interval = setInterval(fetchJobs, 5000)
        return () => clearInterval(interval)
    }, [])

    // WebSocket Integration: Join rooms
    useEffect(() => {
        if (!socket || !isConnected) return
        jobs.forEach(job => {
            if (['searching', 'downloading', 'analyzing'].includes(job.status)) {
                joinJob(job.id)
            }
        })
    }, [jobs, isConnected])

    // WebSocket Integration: Listen for events
    useEffect(() => {
        if (!socket) return

        const handleProgress = (data: any) => {
            setJobs(prev => prev.map(job => {
                if (job.id === data.jobId) {
                    return { ...job, progress: data.progress, status: data.status || job.status }
                }
                return job
            }))
            if (['completed', 'failed', 'cancelled'].includes(data.status)) {
                setTimeout(fetchJobs, 1000)
            }
        }

        socket.on('job_progress', handleProgress)
        return () => { socket.off('job_progress', handleProgress) }
    }, [socket])

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
                return <CheckCircle className="w-5 h-5 text-acid" />
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
            pending: t('common.pending'),
            searching: t('common.searching'),
            downloading: t('common.downloading'),
            analyzing: t('common.analyzing'),
            completed: t('common.completed'),
            failed: t('common.failed'),
            cancelled: t('common.cancelled')
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
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-acid text-sm font-semibold">
                        <Activity className="w-4 h-4" />
                        {t('research.management_center')}
                    </div>
                    <h1 className="text-steel">
                        {t('research.title_main')} <span className="text-zinc-400 font-normal">{t('research.title_prefix')}</span>
                    </h1>
                    <p className="text-steel-dim text-lg font-normal max-w-xl leading-relaxed">
                        {t('research.subtitle')}
                    </p>
                </div>

                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-dim group-focus-within:text-acid transition-colors" />
                    <input
                        type="text"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                        placeholder={t('research.search_placeholder')}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-ash/60 rounded-2xl text-steel text-base focus:outline-none focus:border-acid focus:ring-4 focus:ring-acid/5 transition-all shadow-sm"
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
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-steel">{t('research.empty_archive')}</h3>
                            <p className="text-steel-dim text-base font-normal">
                                {filterQuery ? t('research.no_filter_matches') : t('research.start_first_research')}
                            </p>
                        </div>
                        {!filterQuery && (
                            <Button variant="primary" size="lg" onClick={() => navigate('/')} className="px-12 h-14 text-base">
                                <Activity className="w-5 h-5 mr-3" />
                                {t('research.launch_synthesis')}
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
                                        <div className="flex items-center gap-4">
                                            <h3 className="text-2xl font-semibold group-hover:text-acid transition-colors truncate">
                                                {job.topic}
                                            </h3>
                                            {job.status === 'completed' && (
                                                <div className="px-3 py-1 rounded-lg bg-zinc-100 border border-ash/40 text-xs font-semibold text-steel">
                                                    {t('research.ready')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-steel-dim">
                                            <span className="flex items-center gap-2 py-1.5 px-4 rounded-xl bg-zinc-50 border border-ash/20">
                                                <Clock className="w-4 h-4 text-acid" />
                                                ID: {job.id.slice(0, 8)} • {new Date(job.createdAt).toLocaleDateString(i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
                                            </span>
                                            <span className="flex items-center gap-2 py-1.5 px-4 rounded-xl bg-zinc-50 border border-ash/20">
                                                <FileText className="w-4 h-4 text-plasma" />
                                                {job.articlesFound || 0} {t('research.sources')}
                                            </span>
                                            <div className="flex items-center gap-2 text-steel font-semibold">
                                                <div className={`w-2.5 h-2.5 rounded-full ${job.status === 'completed' ? 'bg-acid' : 'bg-plasma animate-pulse'}`} />
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
                                        className="rounded-2xl border-ash/40 hover:border-steel px-8 text-sm font-semibold"
                                    >
                                        {t('research.open')}
                                    </Button>

                                    {job.status === 'completed' && job.graphId && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            onClick={() => navigate(`/research/${job.id}/graph`)}
                                            className="rounded-2xl px-8 group/btn text-sm font-semibold"
                                        >
                                            <Activity className="w-5 h-5 mr-3 group-hover/btn:animate-pulse" />
                                            {t('research.graph')}
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    )}

                                    {job.status === 'completed' && (
                                        <Button
                                            variant="secondary"
                                            size="lg"
                                            onClick={() => navigate(`/research/${job.id}/citation-map`)}
                                            className="rounded-2xl px-6 text-sm font-medium border-ash/40 hover:border-steel"
                                            title={t('research.citation_map')}
                                        >
                                            🕸️
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
