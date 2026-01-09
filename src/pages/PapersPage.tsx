import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'

interface Article {
    id: string
    title: string
    authors: string[]
    year: number
    abstract?: string
    source: string
    doi?: string
    screeningStatus?: 'pending' | 'included' | 'excluded'
}

interface ResearchJob {
    id: string
    topic: string
    mode?: 'quick' | 'research'
    status: string  // Backend uses: pending, searching, downloading, analyzing, completed, failed
    articlesFound: number
    progress?: number
    articles?: Article[]
    graphId?: string
    error?: string
}

export default function PapersPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [job, setJob] = useState<ResearchJob | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0) // For keyboard navigation
    const { addToast } = useToast()

    // Column configuration for reordering
    type ColumnId = 'checkbox' | 'title' | 'year' | 'source' | 'status'
    interface Column {
        id: ColumnId
        label: string
        width?: number | string
    }
    const [columns, setColumns] = useState<Column[]>(() => {
        // Load columns from localStorage if available
        const saved = localStorage.getItem('papers_columns')
        if (saved) {
            try { return JSON.parse(saved) } catch { }
        }
        return [
            { id: 'checkbox', label: '✅', width: 40 },
            { id: 'title', label: 'Название' },
            { id: 'year', label: 'Год', width: 60 },
            { id: 'source', label: 'Источник', width: 80 },
            { id: 'status', label: 'Статус', width: 100 }
        ]
    })
    const [draggingColumn, setDraggingColumn] = useState<ColumnId | null>(null)

    // Saved views
    interface SavedView {
        id: string
        name: string
        columns: Column[]
        filter?: 'all' | 'included' | 'excluded' | 'pending'
    }
    const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
        const saved = localStorage.getItem('papers_saved_views')
        if (saved) {
            try { return JSON.parse(saved) } catch { }
        }
        return []
    })
    const [currentFilter, setCurrentFilter] = useState<'all' | 'included' | 'excluded' | 'pending'>('all')

    // Persist columns and views to localStorage
    useEffect(() => {
        localStorage.setItem('papers_columns', JSON.stringify(columns))
    }, [columns])

    useEffect(() => {
        localStorage.setItem('papers_saved_views', JSON.stringify(savedViews))
    }, [savedViews])

    const saveCurrentView = () => {
        const name = prompt('Название вида:')
        if (!name) return
        const newView: SavedView = {
            id: `view-${Date.now()}`,
            name,
            columns: [...columns],
            filter: currentFilter
        }
        setSavedViews(prev => [...prev, newView])
        addToast(`Вид "${name}" сохранён`, 'success')
    }

    const loadView = (view: SavedView) => {
        setColumns(view.columns)
        if (view.filter) setCurrentFilter(view.filter)
        addToast(`Вид "${view.name}" загружен`, 'info')
    }

    const deleteView = (viewId: string) => {
        setSavedViews(prev => prev.filter(v => v.id !== viewId))
    }

    // Helper to check if job is in progress
    const isInProgress = (status: string) =>
        ['pending', 'searching', 'downloading', 'analyzing', 'processing'].includes(status)

    // Keyboard shortcuts
    useEffect(() => {
        const articles = job?.articles || []
        if (articles.length === 0) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if ((e.target as HTMLElement).tagName === 'INPUT') return

            switch (e.key.toLowerCase()) {
                case 'j': // Next article
                    setSelectedIndex(i => Math.min(i + 1, articles.length - 1))
                    break
                case 'k': // Previous article
                    setSelectedIndex(i => Math.max(i - 1, 0))
                    break
                case 'i': // Include selected
                    if (articles[selectedIndex]) {
                        setJob(prev => {
                            if (!prev?.articles) return prev
                            const updated = [...prev.articles]
                            updated[selectedIndex] = { ...updated[selectedIndex], screeningStatus: 'included' }
                            return { ...prev, articles: updated }
                        })
                    }
                    break
                case 'e': // Exclude selected
                    if (articles[selectedIndex]) {
                        setJob(prev => {
                            if (!prev?.articles) return prev
                            const updated = [...prev.articles]
                            updated[selectedIndex] = { ...updated[selectedIndex], screeningStatus: 'excluded' }
                            return { ...prev, articles: updated }
                        })
                    }
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [job?.articles, selectedIndex])

    useEffect(() => {
        fetchJob()
        // Poll for updates if job is processing
        const interval = setInterval(fetchJob, 3000)
        setPollingInterval(interval)
        return () => clearInterval(interval)
    }, [id])

    useEffect(() => {
        // Stop polling when job is completed or failed
        if (job && !isInProgress(job.status) && pollingInterval) {
            clearInterval(pollingInterval)
        }
    }, [job?.status])

    const fetchJob = async () => {
        try {
            const response = await fetch(`/api/research/jobs/${id}`)
            if (response.ok) {
                const data = await response.json()
                setJob(data.job)
            }
        } catch (error) {
            console.error('Failed to fetch job:', error)
            addToast('Не удалось загрузить данные задачи', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleContinue = () => {
        if (job?.graphId) {
            navigate(`/research/${id}/graph`)
        } else {
            navigate(`/research/${id}/config`)
        }
    }

    const getStatusDisplay = (status: string) => {
        const statusMap: Record<string, { label: string; bg: string; color: string }> = {
            pending: { label: '⏳ Ожидание...', bg: '#fef3c7', color: '#92400e' },
            searching: { label: '🔍 Поиск статей...', bg: '#dbeafe', color: '#1e40af' },
            downloading: { label: '📥 Загрузка...', bg: '#e0e7ff', color: '#3730a3' },
            analyzing: { label: '🔬 Анализ...', bg: '#fef3c7', color: '#92400e' },
            processing: { label: '⚙️ Обработка...', bg: '#fef3c7', color: '#92400e' },
            completed: { label: '✅ Готово', bg: '#dcfce7', color: '#166534' },
            failed: { label: '❌ Ошибка', bg: '#fee2e2', color: '#991b1b' },
            cancelled: { label: '🚫 Отменено', bg: '#f1f5f9', color: '#475569' }
        }
        return statusMap[status] || { label: `⏳ ${status}...`, bg: '#fef3c7', color: '#92400e' }
    }

    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                    <div style={{ color: '#64748b' }}>Загрузка...</div>
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <div style={{ color: '#64748b', marginBottom: 24 }}>Исследование не найдено</div>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    >
                        На главную
                    </button>
                </div>
            </div>
        )
    }

    const statusDisplay = getStatusDisplay(job.status)

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <header style={{
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
                padding: '16px 24px'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'none', border: 'none',
                            color: '#64748b', fontSize: 14, cursor: 'pointer'
                        }}
                    >
                        ← На главную
                    </button>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>Шаг 2: Найденные статьи</div>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                        📄 {job.topic}
                    </h1>

                    {/* Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                        <span style={{
                            padding: '6px 16px',
                            borderRadius: 20,
                            fontSize: 14,
                            fontWeight: 500,
                            background: statusDisplay.bg,
                            color: statusDisplay.color
                        }}>
                            {statusDisplay.label}
                        </span>
                        <span style={{ color: '#64748b' }}>
                            {job.articlesFound} статей найдено
                        </span>
                    </div>

                    {/* Progress bar for in-progress jobs */}
                    {isInProgress(job.status) && (
                        <div style={{ maxWidth: 400, margin: '24px auto 0' }}>
                            <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                                        width: `${job.progress || 30}%`,
                                        transition: 'width 0.3s ease',
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                                {job.status === 'searching' ? 'Ищем статьи в PubMed и CrossRef...' :
                                    job.status === 'downloading' ? 'Загружаем полные тексты...' :
                                        job.status === 'analyzing' ? 'Извлекаем сущности и связи...' :
                                            'Обрабатываем данные...'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Research Mode: Screening Table */}
                {job.mode === 'research' && job.status === 'completed' && job.articles && (
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        marginBottom: 32
                    }}>
                        <div style={{
                            padding: '16px 24px',
                            borderBottom: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
                        }}>
                            <div>
                                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                                    Скрининг статей ({job.articles.filter(a => a.screeningStatus === 'included').length} выбрано)
                                </h2>
                                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                                    <kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>J</kbd>/<kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>K</kbd> навигация,
                                    <kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontSize: 11, marginLeft: 4 }}>I</kbd>/<kbd style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>E</kbd> include/exclude
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {/* Bulk Actions */}
                                <button
                                    onClick={() => {
                                        const updated = job.articles!.map(a => ({ ...a, screeningStatus: 'included' as const }))
                                        setJob({ ...job, articles: updated })
                                    }}
                                    style={{
                                        padding: '8px 14px',
                                        background: '#dcfce7',
                                        color: '#166534',
                                        border: '1px solid #bbf7d0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✅ Включить все
                                </button>
                                <button
                                    onClick={() => {
                                        const updated = job.articles!.map(a => ({ ...a, screeningStatus: 'excluded' as const }))
                                        setJob({ ...job, articles: updated })
                                    }}
                                    style={{
                                        padding: '8px 14px',
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        border: '1px solid #fecaca',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        cursor: 'pointer'
                                    }}
                                >
                                    ❌ Исключить все
                                </button>
                                <button
                                    onClick={() => {
                                        const updated = job.articles!.map(a => ({ ...a, screeningStatus: 'pending' as const }))
                                        setJob({ ...job, articles: updated })
                                    }}
                                    style={{
                                        padding: '8px 14px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔄 Сбросить
                                </button>
                                <div style={{ width: 1, background: '#e2e8f0', margin: '0 4px' }} />
                                {/* Export */}
                                <a
                                    href={`/api/research/jobs/${id}/export/csv`}
                                    download
                                    style={{
                                        padding: '8px 14px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        textDecoration: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📥 CSV
                                </a>
                                <a
                                    href={`/api/research/jobs/${id}/export/bibtex`}
                                    download
                                    style={{
                                        padding: '8px 14px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        textDecoration: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📚 BibTeX
                                </a>
                            </div>
                        </div>

                        {/* Views & Filters Toolbar */}
                        <div style={{ padding: '12px 24px', display: 'flex', gap: 16, alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                            {/* Filter tabs */}
                            <div style={{ display: 'flex', gap: 4 }}>
                                {(['all', 'pending', 'included', 'excluded'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setCurrentFilter(f)}
                                        style={{
                                            padding: '6px 12px',
                                            background: currentFilter === f ? '#3b82f6' : '#f1f5f9',
                                            color: currentFilter === f ? 'white' : '#64748b',
                                            border: 'none',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {f === 'all' ? 'Все' : f === 'pending' ? 'Ожидают' : f === 'included' ? 'Включены' : 'Исключены'}
                                    </button>
                                ))}
                            </div>

                            <div style={{ flex: 1 }} />

                            {/* Saved views */}
                            {savedViews.length > 0 && (
                                <select
                                    onChange={(e) => {
                                        const view = savedViews.find(v => v.id === e.target.value)
                                        if (view) loadView(view)
                                    }}
                                    defaultValue=""
                                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}
                                >
                                    <option value="" disabled>📁 Загрузить вид...</option>
                                    {savedViews.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={saveCurrentView}
                                style={{
                                    padding: '6px 12px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    fontSize: 12,
                                    cursor: 'pointer'
                                }}
                            >
                                💾 Сохранить вид
                            </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                                <thead>
                                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                                        {columns.map((col) => (
                                            <th
                                                key={col.id}
                                                draggable={col.id !== 'checkbox'}
                                                onDragStart={() => setDraggingColumn(col.id)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={() => {
                                                    if (draggingColumn && draggingColumn !== col.id) {
                                                        const fromIndex = columns.findIndex(c => c.id === draggingColumn)
                                                        const toIndex = columns.findIndex(c => c.id === col.id)
                                                        const newCols = [...columns]
                                                        const [moved] = newCols.splice(fromIndex, 1)
                                                        newCols.splice(toIndex, 0, moved)
                                                        setColumns(newCols)
                                                    }
                                                    setDraggingColumn(null)
                                                }}
                                                onDragEnd={() => setDraggingColumn(null)}
                                                style={{
                                                    padding: '12px 16px',
                                                    width: col.width,
                                                    cursor: col.id !== 'checkbox' ? 'grab' : 'default',
                                                    background: draggingColumn === col.id ? '#e2e8f0' : undefined,
                                                    userSelect: 'none'
                                                }}
                                            >
                                                {col.label}
                                                {col.id !== 'checkbox' && <span style={{ marginLeft: 4, opacity: 0.4 }}>⋮⋮</span>}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {job.articles
                                        .filter(article => {
                                            if (currentFilter === 'all') return true
                                            if (currentFilter === 'pending') return article.screeningStatus === 'pending' || !article.screeningStatus
                                            return article.screeningStatus === currentFilter
                                        })
                                        .map((article, index) => {
                                            const isIncluded = article.screeningStatus === 'included'
                                            const isExcluded = article.screeningStatus === 'excluded'
                                            const isSelected = index === selectedIndex
                                            return (
                                                <tr
                                                    key={article.id}
                                                    onClick={() => setSelectedIndex(index)}
                                                    style={{
                                                        borderBottom: '1px solid #f1f5f9',
                                                        background: isSelected
                                                            ? '#eff6ff'
                                                            : isIncluded ? '#f0fdf4' : isExcluded ? '#fef2f2' : '#fff',
                                                        opacity: isExcluded ? 0.6 : 1,
                                                        cursor: 'pointer',
                                                        boxShadow: isSelected ? 'inset 3px 0 0 #3b82f6' : 'none'
                                                    }}>
                                                    {columns.map(col => {
                                                        switch (col.id) {
                                                            case 'checkbox':
                                                                return (
                                                                    <td key={col.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isIncluded}
                                                                            onChange={(e) => {
                                                                                const newStatus = (e.target.checked ? 'included' : 'pending') as "included" | "pending"
                                                                                const updatedArticles = job.articles!.map(a =>
                                                                                    a.id === article.id ? { ...a, screeningStatus: newStatus } : a
                                                                                )
                                                                                setJob({ ...job, articles: updatedArticles })
                                                                            }}
                                                                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                                                                        />
                                                                    </td>
                                                                )
                                                            case 'title':
                                                                return (
                                                                    <td key={col.id} style={{ padding: '12px 16px' }}>
                                                                        <div style={{ fontWeight: 500, color: '#1e293b', marginBottom: 4 }}>
                                                                            {article.title}
                                                                        </div>
                                                                        <div style={{ fontSize: 12, color: '#64748b' }}>
                                                                            {article.authors?.slice(0, 2).join(', ')}{article.authors?.length > 2 ? ' et al.' : ''}
                                                                        </div>
                                                                        {article.abstract && (
                                                                            <details style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
                                                                                <summary style={{ cursor: 'pointer', userSelect: 'none' }}>Показать аннотацию</summary>
                                                                                <p style={{ marginTop: 4, lineHeight: 1.5 }}>{article.abstract}</p>
                                                                            </details>
                                                                        )}
                                                                    </td>
                                                                )
                                                            case 'year':
                                                                return <td key={col.id} style={{ padding: '12px 16px', color: '#475569' }}>{article.year}</td>
                                                            case 'source':
                                                                return (
                                                                    <td key={col.id} style={{ padding: '12px 16px' }}>
                                                                        <span style={{
                                                                            fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                                                            background: article.source === 'pubmed' ? '#dbeafe' : '#ffedd5',
                                                                            color: article.source === 'pubmed' ? '#1e40af' : '#9a3412'
                                                                        }}>
                                                                            {article.source}
                                                                        </span>
                                                                    </td>
                                                                )
                                                            case 'status':
                                                                return (
                                                                    <td key={col.id} style={{ padding: '12px 16px' }}>
                                                                        {isExcluded ? (
                                                                            <button
                                                                                onClick={() => {
                                                                                    const updatedArticles = job.articles!.map(a =>
                                                                                        a.id === article.id ? { ...a, screeningStatus: 'pending' as const } : a
                                                                                    )
                                                                                    setJob({ ...job, articles: updatedArticles })
                                                                                }}
                                                                                style={{ fontSize: 11, color: '#ef4444', background: 'white', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer' }}
                                                                            >
                                                                                Вернуть
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => {
                                                                                    const updatedArticles = job.articles!.map(a =>
                                                                                        a.id === article.id ? { ...a, screeningStatus: 'excluded' as const } : a
                                                                                    )
                                                                                    setJob({ ...job, articles: updatedArticles })
                                                                                }}
                                                                                style={{ fontSize: 11, color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                                            >
                                                                                Исключить
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                )
                                                            default:
                                                                return null
                                                        }
                                                    })}
                                                </tr>
                                            )
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Quick Mode: List View (Legacy) */}
                {(job.mode !== 'research' || job.status !== 'completed') && job.articles && job.articles.length > 0 && (
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        marginBottom: 32
                    }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                                Найденные статьи ({job.articles.length})
                            </h2>
                        </div>
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {job.articles.map((article, index) => (
                                <div
                                    key={article.id}
                                    style={{
                                        padding: '16px 24px',
                                        borderBottom: index < job.articles!.length - 1 ? '1px solid #f1f5f9' : 'none'
                                    }}
                                >
                                    <div style={{ fontWeight: 500, color: '#1e293b', marginBottom: 6 }}>
                                        {article.title}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b' }}>
                                        {article.authors?.slice(0, 3).join(', ')}{article.authors?.length > 3 ? ' et al.' : ''} • {article.year} • {article.source}
                                    </div>
                                    {article.abstract && (
                                        <div style={{
                                            fontSize: 13,
                                            color: '#94a3b8',
                                            marginTop: 8,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {article.abstract}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Continue Actions */}
                {job.status === 'completed' && (
                    <div style={{ display: 'flex', gap: 16 }}>
                        {job.mode === 'research' && (
                            <button
                                onClick={async () => {
                                    setIsLoading(true);
                                    // Save screening decisions
                                    const includedIds = job.articles!.filter(a => a.screeningStatus === 'included').map(a => a.id)
                                    const excludedIds = job.articles!.filter(a => a.screeningStatus === 'excluded').map(a => a.id)

                                    try {
                                        await fetch(`/api/research/jobs/${id}/screening`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ includedIds, excludedIds })
                                        })
                                        // Navigate to config
                                        navigate(`/research/${id}/config`)
                                    } catch (e) {
                                        console.error(e)
                                    } finally {
                                        setIsLoading(false)
                                    }
                                }}
                                disabled={!job.articles?.some(a => a.screeningStatus === 'included')}
                                style={{
                                    flex: 2,
                                    padding: '18px',
                                    background: job.articles?.some(a => a.screeningStatus === 'included') ? '#2563eb' : '#94a3b8',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 14,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: job.articles?.some(a => a.screeningStatus === 'included') ? 'pointer' : 'not-allowed',
                                    transition: 'background 0.2s'
                                }}
                            >
                                ⚙️ Настроить анализ ({job.articles?.filter(a => a.screeningStatus === 'included').length}) →
                            </button>
                        )}

                        {(job.mode !== 'research') && (
                            <button
                                onClick={handleContinue}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 14,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {job.graphId ? '🕸️ Перейти к графу →' : '⚙️ Настроить и построить граф →'}
                            </button>
                        )}
                    </div>
                )}
            </main>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
        </div>
    )
}
