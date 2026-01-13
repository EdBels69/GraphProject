import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, FileText, Activity, Trash2, ArrowRight,
  Loader2, Filter, Database, Clock, Sparkles, FileUp
} from 'lucide-react'
import { useApi, useApiPost, useApiDelete } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useTranslation } from 'react-i18next'

interface ResearchJob {
  id: string
  topic: string
  status: string
  articlesFound: number
  graphId?: string
  createdAt: string
}

interface SearchOptions {
  mode: 'quick' | 'research'
  sources: {
    pubmed: boolean
    crossref: boolean
    arxiv: boolean
    biorxiv: boolean
    scholar: boolean
  }
  scopusQuartile?: ('Q1' | 'Q2' | 'Q3' | 'Q4')[]
  wosQuartile?: ('Q1' | 'Q2' | 'Q3' | 'Q4')[]
  sjrQuartile?: ('Q1' | 'Q2' | 'Q3' | 'Q4')[]
  minImpactFactor?: number
  fromDate?: string
  toDate?: string
}

const currentYear = new Date().getFullYear()

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [options, setOptions] = useState<SearchOptions>({
    mode: 'research',
    fromDate: `${currentYear - 5}-01-01`,
    toDate: `${currentYear}-12-31`,
    sources: {
      pubmed: true,
      crossref: true,
      arxiv: false,
      biorxiv: false,
      scholar: false
    },
    scopusQuartile: undefined,
    wosQuartile: undefined,
    sjrQuartile: undefined,
    minImpactFactor: 0
  })

  const { data: jobsData, loading: listLoading, refetch: fetchRecentJobs } = useApi<{ jobs: ResearchJob[] }>(API_ENDPOINTS.RESEARCH.JOBS_LIST)
  const recentJobs = jobsData?.jobs || []

  const { postData: startResearch, loading: postLoading } = useApiPost<{ job: { id: string } }>(API_ENDPOINTS.RESEARCH.JOBS_LIST)
  const { deleteData: deleteJob } = useApiDelete<any>((id: string) => API_ENDPOINTS.RESEARCH.JOBS(id))

  const isLoading = listLoading || postLoading

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: t('common.pending') || 'Pending',
      searching: t('common.searching') || 'Searching...',
      downloading: t('common.downloading') || 'Downloading...',
      analyzing: t('common.analyzing') || 'Analyzing...',
      completed: t('common.completed') || 'Completed',
      failed: t('common.failed') || 'Failed',
      cancelled: t('common.cancelled') || 'Cancelled'
    }
    return texts[status] || status
  }
  const [validationError, setValidationError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  const handleStartResearch = async () => {
    setValidationError(null)
    if (!topic.trim()) return

    // Date Validation
    if (options.fromDate && options.toDate && options.fromDate > options.toDate) {
      setValidationError(t('home.error_date_range') || 'Start date cannot be after end date')
      return
    }
    if ((options.fromDate && options.fromDate > today) || (options.toDate && options.toDate > today)) {
      setValidationError(t('home.error_future_date') || 'Dates cannot be in the future')
      return
    }

    const sources: string[] = []
    if (options.sources.pubmed) sources.push('pubmed')
    if (options.sources.crossref) sources.push('crossref')
    if (options.sources.arxiv) sources.push('arxiv')
    if (options.sources.biorxiv) sources.push('biorxiv')
    if (options.sources.scholar) sources.push('scholar')

    try {
      const data = await startResearch({
        topic,
        mode: options.mode,
        fromDate: options.fromDate,
        toDate: options.toDate,
        sources,
        scopusQuartile: options.scopusQuartile,
        wosQuartile: options.wosQuartile,
        sjrQuartile: options.sjrQuartile,
        minImpactFactor: options.minImpactFactor
      })
      if (data?.job?.id) {
        navigate(`/research/${data.job.id}/papers`)
      } else {
        setValidationError(t('home.validation_error'))
      }
    } catch (error) {
      console.error('Failed to start research:', error)
      setValidationError(`${t('home.launch_error')}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Localize confirm
    if (!window.confirm(t('home.confirm_delete'))) return

    try {
      await deleteJob(id)
      fetchRecentJobs()
    } catch (error) {
      console.error('Failed to delete job:', error)
    }
  }

  const openJob = (job: ResearchJob) => {
    if (job.graphId) {
      navigate(`/research/${job.id}/graph`)
    } else if (job.status === 'completed') {
      navigate(`/research/${job.id}/config`)
    } else {
      navigate(`/research/${job.id}/papers`)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 animate-fade-in relative px-4">
      {/* Hero Header */}
      <div className="text-center space-y-4 relative z-10 max-w-2xl">
        <h1 className="text-steel">
          {t('home.hero_title')} <span className="text-acid">{t('home.hero_accent')}</span>
        </h1>
        <p className="text-steel-dim text-lg font-normal leading-relaxed">
          {t('home.hero_subtitle')}
        </p>
      </div>

      {/* Main Search Area */}
      <div className="w-full max-w-3xl space-y-8 relative z-10">
        <div className="relative group">
          <div className="relative flex items-center bg-white border-2 border-ash/40 rounded-2xl shadow-sm transition-all duration-300 focus-within:border-acid focus-within:ring-4 focus-within:ring-acid/5">
            <div className="pl-6 text-steel-dim/60">
              <Search className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
              placeholder={t('home.placeholder')}
              className="w-full bg-transparent border-none py-6 px-4 text-base font-normal focus:ring-0 placeholder:text-steel-dim/40"
            />
            <div className="pr-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartResearch}
                disabled={isLoading || !topic.trim()}
                className="rounded-xl px-10"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : t('home.new_research')}
              </Button>
            </div>
          </div>
        </div>

        {/* Sources Bar */}
        <div className="flex flex-col items-center gap-4 py-6 border-y border-ash/20">
          <span className="text-sm font-semibold text-steel-dim">
            {t('home.sources_label')}
          </span>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { id: 'pubmed', label: t('home.source_pubmed') },
              { id: 'crossref', label: t('home.source_crossref') },
              { id: 'arxiv', label: t('home.source_arxiv') },
              { id: 'biorxiv', label: t('home.source_biorxiv') },
              { id: 'scholar', label: t('home.source_scholar') }
            ].map(source => (
              <button
                key={source.id}
                onClick={() => setOptions(o => ({
                  ...o,
                  sources: { ...o.sources, [source.id]: !((o.sources as any)[source.id]) }
                }))}
                className={`flex items-center gap-2 group transition-all duration-200 ${(options.sources as any)[source.id]
                  ? 'opacity-100'
                  : 'opacity-40 hover:opacity-100'
                  }`}
              >
                <div className={`w-4 h-4 rounded border-2 transition-colors flex items-center justify-center ${(options.sources as any)[source.id] ? 'bg-acid border-acid' : 'border-ash/60'
                  }`}>
                  {(options.sources as any)[source.id] && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm font-medium transition-colors ${(options.sources as any)[source.id] ? 'text-steel' : 'text-steel-dim'
                  }`}>
                  {source.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {validationError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center animate-shake font-mono uppercase tracking-widest">
            {validationError}
          </div>
        )}


        <div className="glass-panel p-10 animate-fade-in space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Row 1, Col 1: Date Range */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-steel block">
                Publication Date Range
              </label>
              <div className="flex flex-col gap-3">
                <input
                  type="date"
                  max={today}
                  value={options.fromDate}
                  onChange={e => setOptions(o => ({ ...o, fromDate: e.target.value }))}
                  className="w-full bg-void border border-ash/60 rounded-xl py-3 px-4 text-sm font-normal text-steel focus:border-acid focus:ring-4 focus:ring-acid/5 transition-all"
                />
                <input
                  type="date"
                  max={today}
                  value={options.toDate}
                  onChange={e => setOptions(o => ({ ...o, toDate: e.target.value }))}
                  className="w-full bg-void border border-ash/60 rounded-xl py-3 px-4 text-sm font-normal text-steel focus:border-acid focus:ring-4 focus:ring-acid/5 transition-all"
                />
              </div>
            </div>

            {/* Row 1, Col 2: Impact Factor */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-steel block">
                Impact Factor (IF) ≥
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={options.minImpactFactor}
                  onChange={e => setOptions(o => ({ ...o, minImpactFactor: Number(e.target.value) }))}
                  className="w-full bg-void border border-ash/60 rounded-xl py-3 px-4 text-base font-normal text-steel focus:border-acid focus:ring-4 focus:ring-acid/5 transition-all"
                />
              </div>
              <div className="text-xs text-steel-dim leading-relaxed">
                Uses OpenAlex Impact Score as a proxy for current journal IF.
              </div>
            </div>

            {/* Row 1, Col 3-4: Quartiles */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <label className="text-sm font-semibold text-steel block">
                Database Quartiles (Scopus, WoS, SJR)
              </label>

              <div className="space-y-4">
                {[
                  { label: 'Scopus', key: 'scopusQuartile' },
                  { label: 'WoS', key: 'wosQuartile' },
                  { label: 'SJR', key: 'sjrQuartile' }
                ].map(metric => (
                  <div key={metric.key} className="flex items-center gap-6">
                    <span className="text-sm font-medium text-steel-dim w-16">{metric.label}:</span>
                    <div className="flex gap-2 flex-1">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                        <button
                          key={q}
                          onClick={() => setOptions(o => {
                            const currentSelected = (o as any)[metric.key] || []
                            const newSelected = currentSelected.includes(q)
                              ? currentSelected.filter((v: string) => v !== q)
                              : [...currentSelected, q]
                            return { ...o, [metric.key]: newSelected.length > 0 ? newSelected : undefined }
                          })}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${((options as any)[metric.key] || []).includes(q)
                            ? 'bg-acid text-white border-acid shadow-sm'
                            : 'bg-void text-steel-dim border-ash/40 hover:border-acid/30'
                            }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs - Bottom Bar Style */}
      {recentJobs.length > 0 && (
        <div className="w-full max-w-6xl pt-12 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6 px-4">
            <h5 className="flex items-center gap-3 text-steel-dim/50">
              <Clock className="w-4 h-4" />
              {t('home.recent_projects')}
            </h5>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-bold text-acid hover:tracking-widest transition-all uppercase"
            >
              {t('home.full_archive')} →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            {recentJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/papers/${job.id}`)}
                className="glass-panel-heavy p-6 cursor-pointer hover:border-acid active:scale-[0.98] transition-all group flex items-start gap-4"
              >
                <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${job.status === 'completed' ? 'bg-acid shadow-sm' : 'bg-plasma animate-pulse'}`} />
                <div className="min-w-0">
                  <h5 className="truncate mb-2 text-steel">{job.topic}</h5>
                  <p className="text-xs text-steel-dim font-medium">
                    {job.articlesFound || 0} {t('papers.records_found')} • {getStatusText(job.status)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
