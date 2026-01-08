import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
    mode: 'research',  // Default to research mode for methodological rigor
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

  const handleFileUpload = () => {
    navigate('/upload')
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

  const maxArticlesPresets = [
    { value: 20, label: '🚀 Быстрый' },
    { value: 50, label: '📊 Стандарт' },
    { value: 100, label: '📚 Глубокий' },
    { value: 200, label: '🔬 Полный' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)' }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 20 }}>🧬</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', margin: 0 }}>Graph Analyser</h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            Постройте граф знаний
          </h2>
          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
            Анализируйте научную литературу, извлекайте связи между сущностями
            и визуализируйте знания с помощью AI
          </p>
        </div>

        {/* Two Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 64 }}>
          {/* Option 1: Search */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: 56, height: 56,
              background: '#dbeafe',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24
            }}>
              <span style={{ fontSize: 28 }}>🔬</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
              Поиск по теме
            </h3>
            <p style={{ color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              Введите тему исследования — мы найдём статьи в PubMed и CrossRef
            </p>

            {/* Topic Input */}
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !showAdvanced && handleStartResearch()}
              placeholder="Например: carnitine metabolism"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontSize: 15,
                marginBottom: 16,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Mode Selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => setOptions(o => ({ ...o, mode: 'quick' }))}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: 10,
                  border: options.mode === 'quick' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: options.mode === 'quick' ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>🚀</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Quick</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Авто-анализ</div>
              </button>
              <button
                onClick={() => setOptions(o => ({ ...o, mode: 'research' }))}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: 10,
                  border: options.mode === 'research' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  background: options.mode === 'research' ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>📊</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Research</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Таблица + Screening</div>
              </button>
            </div>

            {/* Mode description */}
            <div style={{
              fontSize: 12,
              color: '#64748b',
              background: '#f8fafc',
              padding: '8px 12px',
              borderRadius: 8,
              marginBottom: 12
            }}>
              {options.mode === 'quick'
                ? '⚡ Быстрый режим: статьи автоматически анализируются и строится граф'
                : '📋 Research режим: таблица статей → ручной отбор → настройка анализа'}
            </div>

            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 13,
                color: '#64748b',
                cursor: 'pointer',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              ⚙️ Расширенные настройки {showAdvanced ? '▲' : '▼'}
            </button>


            {/* Advanced Options */}
            {showAdvanced && (
              <div style={{
                padding: 16,
                background: '#f8fafc',
                borderRadius: 12,
                marginBottom: 16,
                fontSize: 13
              }}>
                {/* Max Articles */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 500, color: '#475569', marginBottom: 8 }}>
                    📊 Макс. статей: {options.maxArticles}
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                    {maxArticlesPresets.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => setOptions(o => ({ ...o, maxArticles: preset.value }))}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: options.maxArticles === preset.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                          background: options.maxArticles === preset.value ? '#eff6ff' : '#fff',
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        {preset.label} ({preset.value})
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={options.maxArticles}
                    onChange={(e) => setOptions(o => ({ ...o, maxArticles: parseInt(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                    <span>10</span>
                    <span>1000</span>
                  </div>
                </div>

                {/* Year Range */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 500, color: '#475569', marginBottom: 8 }}>
                    📅 Годы публикации
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="number"
                      min="1990"
                      max={currentYear}
                      value={options.yearFrom}
                      onChange={(e) => setOptions(o => ({ ...o, yearFrom: parseInt(e.target.value) }))}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6 }}
                    />
                    <span style={{ color: '#94a3b8' }}>—</span>
                    <input
                      type="number"
                      min="1990"
                      max={currentYear}
                      value={options.yearTo}
                      onChange={(e) => setOptions(o => ({ ...o, yearTo: parseInt(e.target.value) }))}
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6 }}
                    />
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <label style={{ display: 'block', fontWeight: 500, color: '#475569', marginBottom: 8 }}>
                    📚 Источники
                  </label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={options.sources.pubmed}
                        onChange={(e) => setOptions(o => ({ ...o, sources: { ...o.sources, pubmed: e.target.checked } }))}
                      />
                      PubMed
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={options.sources.crossref}
                        onChange={(e) => setOptions(o => ({ ...o, sources: { ...o.sources, crossref: e.target.checked } }))}
                      />
                      CrossRef
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Time Warning for large searches */}
            {options.maxArticles > 100 && showAdvanced && (
              <div style={{
                padding: '8px 12px',
                background: '#fef3c7',
                borderRadius: 8,
                fontSize: 12,
                color: '#92400e',
                marginBottom: 12
              }}>
                ⚠️ Обработка {options.maxArticles} статей займёт ~{Math.ceil(options.maxArticles / 30)} мин
              </div>
            )}

            <button
              onClick={handleStartResearch}
              disabled={isLoading || !topic.trim()}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading || !topic.trim() ? '#94a3b8' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: isLoading || !topic.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Поиск...' : `Начать исследование (${options.maxArticles} статей) →`}
            </button>
          </div>

          {/* Option 2: Upload */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: 56, height: 56,
              background: '#ccfbf1',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24
            }}>
              <span style={{ fontSize: 28 }}>📤</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
              Загрузить файлы
            </h3>
            <p style={{ color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
              Загрузите свои PDF или текстовые документы для анализа
            </p>
            <div style={{ height: 52, marginBottom: 16 }}></div>
            <button
              onClick={handleFileUpload}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0d9488',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Выбрать файлы →
            </button>
          </div>
        </div>

        {/* Recent Researches */}
        {
          recentJobs.length > 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
                Недавние исследования
              </h3>
              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                {recentJobs.slice(0, 5).map((job, index) => (
                  <div
                    key={job.id}
                    onClick={() => openJob(job)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 24px',
                      borderBottom: index < recentJobs.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: '#1e293b' }}>{job.topic}</div>
                      <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                        {job.articlesFound} статей • {new Date(job.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        background: job.status === 'completed' ? '#dcfce7' : job.status === 'processing' ? '#fef3c7' : '#f1f5f9',
                        color: job.status === 'completed' ? '#166534' : job.status === 'processing' ? '#92400e' : '#475569'
                      }}>
                        {job.status === 'completed' ? 'Готово' : job.status === 'processing' ? 'В процессе' : job.status}
                      </span>
                      <span style={{ color: '#94a3b8' }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      </main >
    </div >
  )
}
