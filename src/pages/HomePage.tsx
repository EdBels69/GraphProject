import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, FileText, Activity, Trash2, ArrowRight,
  Loader2, Filter, Database, Clock, Sparkles, FileUp
} from 'lucide-react'

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
  const [recentJobs, setRecentJobs] = useState<ResearchJob[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [options, setOptions] = useState<SearchOptions>({
    mode: 'research',
    maxArticles: 50,
    yearFrom: currentYear - 5,
    yearTo: currentYear,
    sources: { pubmed: true, crossref: true }
  })

  useEffect(() => {
    fetchRecentJobs()
  }, [])

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch('/api/research/jobs')
      if (response.ok) {
        const data = await response.json()
        setRecentJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
  }

  const handleStartResearch = async () => {
    if (!topic.trim()) return
    setIsLoading(true)

    const sources: string[] = []
    if (options.sources.pubmed) sources.push('pubmed')
    if (options.sources.crossref) sources.push('crossref')

    try {
      const response = await fetch('/api/research/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          mode: options.mode,
          maxArticles: options.maxArticles,
          yearFrom: options.yearFrom,
          yearTo: options.yearTo,
          sources
        })
      })
      const data = await response.json()
      if (data.job?.id) {
        navigate(`/research/${data.job.id}/papers`)
      }
    } catch (error) {
      console.error('Failed to start research:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Delete this investigation record?')) return

    try {
      const response = await fetch(`/api/research/jobs/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setRecentJobs(prev => prev.filter(job => job.id !== id))
      }
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
      <div className="text-center space-y-6 py-8 animate-fade-in">
        <h2 className="text-5xl lg:text-7xl font-display font-bold text-white tracking-tight leading-none pointer-events-none select-none">
          KNOWLEDGE <span className="text-acid text-glow">SYNTHESIS</span>
        </h2>
        <p className="text-lg text-steel/60 max-w-2xl mx-auto font-light tracking-wide">
          Construct semantic graphs from scientific literature.
          Analyze relationships with neural precision.
        </p>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Research Card */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:border-acid/30">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-acid/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-acid" />
            </div>

            <h3 className="text-2xl font-display font-bold text-white mb-2">NEW INVESTIGATION</h3>
            <p className="text-gray-400 mb-8 text-sm">
              Initiate a deep search across PubMed & CrossRef databases.
            </p>

            <div className="space-y-5 mt-auto">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !showAdvanced && handleStartResearch()}
                placeholder="Enter research topic (e.g., 'CRISPR applications')..."
                className="w-full bg-void/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:border-acid focus:ring-1 focus:ring-acid outline-none transition-all font-mono text-sm"
              />

              {/* Mode Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOptions(o => ({ ...o, mode: 'quick' }))}
                  className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden ${options.mode === 'quick'
                      ? 'bg-acid/10 border-acid text-white'
                      : 'bg-void/30 border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className={`w-4 h-4 ${options.mode === 'quick' ? 'text-acid' : ''}`} />
                    <span className="font-display font-bold text-sm tracking-wider">QUICK</span>
                  </div>
                  <div className="text-[10px] opacity-60">Automated Pipeline</div>
                </button>

                <button
                  onClick={() => setOptions(o => ({ ...o, mode: 'research' }))}
                  className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden ${options.mode === 'research'
                      ? 'bg-plasma/10 border-plasma text-white'
                      : 'bg-void/30 border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Database className={`w-4 h-4 ${options.mode === 'research' ? 'text-plasma-light' : ''}`} />
                    <span className="font-display font-bold text-sm tracking-wider">RESEARCH</span>
                  </div>
                  <div className="text-[10px] opacity-60">Manual Screening</div>
                </button>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors w-full justify-center py-2"
              >
                <Filter className="w-3 h-3" />
                {showAdvanced ? 'HIDE OPTIONS' : 'ADVANCED CONFIGURATION'}
              </button>

              {showAdvanced && (
                <div className="p-4 bg-void/40 rounded-xl border border-white/5 space-y-4 animate-fade-in text-sm">
                  {/* Simplified advanced options for UI cleanliness */}
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Article Limit: <span className="text-white">{options.maxArticles}</span></span>
                    <input
                      type="range" min="10" max="200" step="10"
                      value={options.maxArticles}
                      onChange={e => setOptions(o => ({ ...o, maxArticles: Number(e.target.value) }))}
                      className="w-32 accent-acid"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleStartResearch}
                disabled={isLoading || !topic.trim()}
                className="w-full bg-acid text-void font-display font-bold tracking-widest text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-glow-acid"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>INITIALIZE <ArrowRight className="w-5 h-5 ml-1" /></>}
              </button>
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:border-white/20">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-plasma/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-plasma/10 border border-plasma/20 flex items-center justify-center mb-6">
              <FileUp className="w-6 h-6 text-plasma-light" />
            </div>

            <h3 className="text-2xl font-display font-bold text-white mb-2">DATA INGESTION</h3>
            <p className="text-gray-400 mb-8 text-sm">
              Upload PDF or Text documents to the secure vault for analysis.
            </p>

            <div className="mt-auto border-2 border-dashed border-white/10 rounded-2xl h-48 flex flex-col items-center justify-center gap-4 group-hover:border-plasma/30 transition-colors cursor-pointer bg-void/20" onClick={() => navigate('/upload')}>
              <div className="p-4 rounded-full bg-void border border-white/5 group-hover:scale-110 transition-transform duration-300">
                <FileUp className="w-6 h-6 text-gray-400 group-hover:text-plasma-light" />
              </div>
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Drop files or click</span>
            </div>

            <button
              onClick={() => navigate('/upload')}
              className="w-full mt-5 bg-white/5 hover:bg-white/10 text-white font-display font-bold tracking-widest text-sm py-4 rounded-xl transition-all border border-white/5"
            >
              OPEN UPLOADER
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentJobs.length > 0 && (
        <div className="max-w-6xl mx-auto pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-white tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-acid" />
              SYSTEM ACTIVITY
            </h3>
            <span className="text-xs font-mono text-gray-500">{recentJobs.length} RECORDS</span>
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
                    <h4 className="font-medium text-white group-hover:text-acid transition-colors">{job.topic}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                        <Database className="w-3 h-3" /> {job.articlesFound} items
                      </span>
                      <span className="text-xs font-mono text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleDeleteJob(job.id, e)}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
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
