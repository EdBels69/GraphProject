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
    yearFrom: currentYear - 5,
    yearTo: currentYear,
    sources: { pubmed: true, crossref: false }
  })

  const { data: jobsData, loading: listLoading, refetch: fetchRecentJobs } = useApi<{ jobs: ResearchJob[] }>(API_ENDPOINTS.RESEARCH.JOBS_LIST)
  const recentJobs = jobsData?.jobs || []

  const { postData: startResearch, loading: postLoading } = useApiPost<{ job: { id: string } }>(API_ENDPOINTS.RESEARCH.JOBS_LIST)
  const { deleteData: deleteJob } = useApiDelete<any>((id: string) => API_ENDPOINTS.RESEARCH.JOBS(id))

  const isLoading = listLoading || postLoading

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Ожидание',
      searching: 'Поиск...',
      downloading: 'Загрузка...',
      analyzing: 'Анализ...',
      completed: 'Завершен',
      failed: 'Ошибка',
      cancelled: 'Отменен'
    }
    return texts[status] || status
  }
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleStartResearch = async () => {
    setValidationError(null)
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
      } else {
        setValidationError('Ошибка: Сервер не вернул ID задачи. Проверьте консоль.')
      }
    } catch (error) {
      console.error('Failed to start research:', error)
      setValidationError(`Ошибка запуска: ${error instanceof Error ? error.message : String(error)}`)
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

                  <div className="pt-2 border-t border-ash/10 space-y-2">
                    <p className="text-xs text-steel-dim uppercase tracking-wider font-bold mb-2">Источники поиска</p>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-acid transition-colors">
                        <input
                          type="checkbox"
                          checked={options.sources.pubmed}
                          onChange={e => setOptions(o => ({ ...o, sources: { ...o.sources, pubmed: e.target.checked } }))}
                          className="accent-acid rounded-sm"
                        />
                        <span>PubMed (Мед.)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-plasma transition-colors">
                        <input
                          type="checkbox"
                          checked={options.sources.crossref}
                          onChange={e => setOptions(o => ({ ...o, sources: { ...o.sources, crossref: e.target.checked } }))}
                          className="accent-plasma rounded-sm"
                        />
                        <span>CrossRef (Строгий)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-not-allowed opacity-50" title="Доступно только в платной версии">
                        <input type="checkbox" disabled className="rounded-sm" />
                        <span>Google Scholar</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-not-allowed opacity-50" title="Требуется ключ API">
                        <input type="checkbox" disabled className="rounded-sm" />
                        <span>ACS (Химия)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {validationError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                  {validationError}
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
        <div
          onClick={() => navigate('/upload')}
          className="glass-panel p-10 rounded-[2.5rem] flex flex-col group cursor-pointer hover:border-plasma/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-plasma/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="space-y-6 relative z-10 flex flex-col h-full">
            <div className="p-4 w-16 h-16 rounded-2xl bg-void border border-ash/10 group-hover:border-plasma/30 group-hover:scale-110 transition-all duration-500 shadow-sm flex items-center justify-center">
              <FileUp className="w-8 h-8 text-plasma-light" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-steel tracking-tighter uppercase">ЗАГРУЗКА <span className="text-plasma-light italic">DATA</span></h2>
              <p className="text-xs font-bold text-steel-dim uppercase tracking-widest leading-relaxed">Извлечение знаний из ваших PDF, DOCX и TXT файлов</p>
            </div>

            <div className="mt-auto pt-6 border-t border-ash/10 flex items-center justify-between text-steel-dim group-hover:text-plasma-light transition-colors">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">ЦЕНТР ОБРАБОТКИ</span>
              <div className="w-10 h-10 rounded-full border border-ash/10 flex items-center justify-center group-hover:border-plasma/30 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentJobs.length > 0 && (
        <div className="max-w-6xl mx-auto pt-8 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-steel tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-acid" />
              ПОСЛЕДНИЕ ПРОЕКТЫ
            </h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-[10px] font-bold text-steel-dim hover:text-acid transition-colors flex items-center gap-1 tracking-widest uppercase"
            >
              ВЕСЬ АРХИВ <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                onClick={() => openJob(job)}
                className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-acid/30 transition-all group relative overflow-hidden"
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-2 h-2 rounded-full ${job.status === 'completed' ? 'bg-acid shadow-glow-acid' : 'bg-plasma animate-pulse'}`} />
                    <span className="text-[10px] font-mono text-steel-dim">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display font-bold text-steel group-hover:text-acid transition-colors truncate">{job.topic}</h4>
                    <p className="text-[10px] text-steel-dim uppercase tracking-wider">{job.articlesFound || 0} источников • {getStatusText(job.status)}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-steel-dim group-hover:text-acid transition-colors">
                    <span className="text-[10px] font-bold tracking-widest">ОТКРЫТЬ</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
