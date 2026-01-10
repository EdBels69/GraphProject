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
  maxArticles: number
  yearFrom: number
  yearTo: number
  sources: {
    pubmed: boolean
    crossref: boolean
  }
}

const currentYear = new Date().getFullYear()

export default function HomePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [options, setOptions] = useState<SearchOptions>({
    mode: 'research',
    maxArticles: 50,
    yearFrom: currentYear - 5,
    yearTo: currentYear,
    sources: { pubmed: true, crossref: true }
  })

  const { data: jobsData, loading: listLoading, refetch: fetchRecentJobs } = useApi<{ jobs: ResearchJob[] }>(API_ENDPOINTS.RESEARCH.JOBS_LIST)
  const recentJobs = jobsData?.jobs || []

  const { postData: startResearch, loading: postLoading } = useApiPost<{ job: { id: string } }>(API_ENDPOINTS.RESEARCH.JOBS_LIST)
  const { deleteData: deleteJob } = useApiDelete<any>((id: string) => API_ENDPOINTS.RESEARCH.JOBS(id))

  const isLoading = listLoading || postLoading


  const handleStartResearch = async () => {
    if (!topic.trim()) return

    const sources: string[] = []
    if (options.sources.pubmed) sources.push('pubmed')
    if (options.sources.crossref) sources.push('crossref')

    try {
      const data = await startResearch({
        topic,
        mode: options.mode,
        maxArticles: options.maxArticles,
        yearFrom: options.yearFrom,
        yearTo: options.yearTo,
        sources
      })
      if (data?.job?.id) {
        navigate(`/research/${data.job.id}/papers`)
      }
    } catch (error) {
      console.error('Failed to start research:', error)
    }
  }

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Удалить эту запись исследования?')) return

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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12 animate-fade-in">
        <h2 className="text-5xl lg:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-steel to-steel/40 tracking-tighter leading-none pointer-events-none select-none">
          СИНТЕЗ <span className="text-acid text-glow">ЗНАНИЙ</span>
        </h2>
        <p className="text-lg text-steel-dim max-w-2xl mx-auto font-light tracking-widest uppercase">
          Построение семантических графов из научной литературы.
          Анализ связей с нейронной точностью.
        </p>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Research Card */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group transition-all duration-500 hover:border-acid/30 hover:shadow-glow-acid/5">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-acid/5 rounded-full blur-3xl pointer-events-none group-hover:bg-acid/10 transition-colors" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 rounded-xl bg-acid/10 border border-acid/20 flex items-center justify-center mb-8 group-hover:shadow-glow-acid transition-all">
              <Search className="w-6 h-6 text-acid" />
            </div>

            <h3 className="text-2xl font-display font-bold text-steel mb-2 tracking-widest">НОВОЕ ИССЛЕДОВАНИЕ</h3>
            <p className="text-steel-dim mb-10 text-xs tracking-wider uppercase">
              Запуск глубокого поиска по базам PubMed и CrossRef.
            </p>

            <div className="space-y-6 mt-auto">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !showAdvanced && handleStartResearch()}
                placeholder="Введите тему исследования (например, 'Применение CRISPR')..."
              />

              {/* Mode Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOptions(o => ({ ...o, mode: 'quick' }))}
                  className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden ${options.mode === 'quick'
                    ? 'bg-acid/10 border-acid text-steel'
                    : 'bg-void border-ash/20 text-steel-dim hover:bg-white hover:border-ash/40'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className={`w-4 h-4 ${options.mode === 'quick' ? 'text-acid' : ''}`} />
                    <span className="font-display font-bold text-sm tracking-wider">БЫСТРЫЙ</span>
                  </div>
                  <div className="text-[10px] opacity-60">Автоматический пайплайн</div>
                </button>

                <button
                  onClick={() => setOptions(o => ({ ...o, mode: 'research' }))}
                  className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden ${options.mode === 'research'
                    ? 'bg-plasma/10 border-plasma text-steel'
                    : 'bg-void border-ash/20 text-steel-dim hover:bg-white hover:border-ash/40'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Database className={`w-4 h-4 ${options.mode === 'research' ? 'text-plasma' : ''}`} />
                    <span className="font-display font-bold text-sm tracking-wider">ИССЛЕДОВАНИЕ</span>
                  </div>
                  <div className="text-[10px] opacity-60">Ручной отбор</div>
                </button>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs text-steel-dim hover:text-steel transition-colors w-full justify-center py-2"
              >
                <Filter className="w-3 h-3" />
                {showAdvanced ? 'СКРЫТЬ ОПЦИИ' : 'РАСШИРЕННЫЕ НАСТРОЙКИ'}
              </button>

              {showAdvanced && (
                <div className="p-4 bg-void border border-ash/20 rounded-xl space-y-4 animate-fade-in text-sm text-steel">
                  {/* Simplified advanced options for UI cleanliness */}
                  <div className="flex justify-between items-center text-steel-dim">
                    <span>Лимит статей: <span className="text-steel font-bold">{options.maxArticles}</span></span>
                    <input
                      type="range" min="10" max="200" step="10"
                      value={options.maxArticles}
                      onChange={e => setOptions(o => ({ ...o, maxArticles: Number(e.target.value) }))}
                      className="w-32 accent-acid"
                    />
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={handleStartResearch}
                disabled={isLoading || !topic.trim()}
                className="w-full shadow-glow-acid/20"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>ЗАПУСТИТЬ <ArrowRight className="w-5 h-5 ml-1" /></>}
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group transition-all duration-500 hover:border-white/20">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-plasma/10 rounded-full blur-3xl pointer-events-none group-hover:bg-plasma/20 transition-colors" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 rounded-xl bg-plasma/10 border border-plasma/20 flex items-center justify-center mb-8 group-hover:shadow-glow-plasma transition-all">
              <FileUp className="w-6 h-6 text-plasma-light" />
            </div>

            <h3 className="text-2xl font-display font-bold text-steel mb-2 tracking-widest">ЗАГРУЗКА ДАННЫХ</h3>
            <p className="text-steel-dim mb-10 text-xs tracking-wider uppercase">
              Загрузка PDF или текстовых документов для анализа.
            </p>

            <div className="mt-auto border-2 border-dashed border-ash/30 rounded-3xl h-48 flex flex-col items-center justify-center gap-4 group-hover:border-plasma transition-all cursor-pointer bg-void" onClick={() => navigate('/upload')}>
              <div className="p-5 rounded-full bg-white border border-ash/10 group-hover:scale-110 group-hover:shadow-glow-plasma/20 transition-all duration-500">
                <FileUp className="w-8 h-8 text-steel/20 group-hover:text-plasma" />
              </div>
              <span className="text-xs font-mono text-steel-dim uppercase tracking-widest group-hover:text-steel">Перетащите файлы или кликните</span>
            </div>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/upload')}
              className="mt-6 w-full"
            >
              ОТКРЫТЬ ЗАГРУЗЧИК
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentJobs.length > 0 && (
        <div className="max-w-6xl mx-auto pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-steel tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-acid" />
              АКТИВНОСТЬ СИСТЕМЫ
            </h3>
            <span className="text-xs font-mono text-steel-dim">{recentJobs.length} ЗАПИСЕЙ</span>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            {recentJobs.slice(0, 5).map((job, i) => (
              <div
                key={job.id}
                onClick={() => openJob(job)}
                className={`
                      p-5 flex items-center justify-between cursor-pointer transition-colors relative group
                      ${i !== recentJobs.length - 1 ? 'border-b border-white/5' : ''}
                      hover:bg-white/5
                   `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${job.status === 'completed' ? 'bg-acid shadow-glow-acid' : 'bg-plasma animate-pulse'}`} />
                  <div>
                    <h4 className="font-medium text-steel group-hover:text-acid transition-colors">{job.topic}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono text-steel-dim flex items-center gap-1">
                        <Database className="w-3 h-3" /> {job.articlesFound} записей
                      </span>
                      <span className="text-xs font-mono text-steel-dim flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleDeleteJob(job.id, e)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
