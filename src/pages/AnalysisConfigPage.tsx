import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface ColumnDefinition {
    id: string
    name: string
    source: string
    domains: string[]
    description: string
    required?: boolean
}

interface ColumnSchema {
    columns: Record<string, ColumnDefinition>
    domain_filters: Record<string, { name: string, description: string, default_visible: string[] }>
    domains?: { id: string, name: string }[]
}

interface ResearchJob {
    id: string
    topic: string
    status: string
    articlesFound: number
    articles?: { id: string, title: string, screeningStatus?: string }[]
}

export default function AnalysisConfigPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [job, setJob] = useState<ResearchJob | null>(null)
    const [schema, setSchema] = useState<ColumnSchema | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Configuration State
    const [extractEntities, setExtractEntities] = useState(true)
    const [extractColumns, setExtractColumns] = useState(true)
    const [selectedDomain, setSelectedDomain] = useState('all')
    const [selectedColumns, setSelectedColumns] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, schemaRes] = await Promise.all([
                    fetch(`/api/research/jobs/${id}`),
                    fetch(`/api/research/schema`)
                ])

                const jobData = await jobRes.json()
                const schemaData = await schemaRes.json()

                // Polyfill domains from domain_filters if missing
                if (schemaData.domain_filters && !schemaData.domains) {
                    schemaData.domains = Object.entries(schemaData.domain_filters).map(([key, val]: [string, any]) => ({
                        id: key,
                        name: val.name
                    }))
                }

                setJob(jobData.job)
                setSchema(schemaData)

                // Pre-select columns for 'all' domain
                if (schemaData?.columns) {
                    const defaultCols = Object.values(schemaData.columns)
                        .filter((c: any) => c.required || c.domains.includes('all'))
                        .map((c: any) => c.id)
                    setSelectedColumns(defaultCols)
                }

            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleStartAnalysis = async () => {
        setIsSubmitting(true)
        try {
            await fetch(`/api/research/jobs/${id}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    extractEntities,
                    extractRelations: extractEntities, // Sync with entities for now
                    extractColumns,
                    domain: selectedDomain
                    // We aren't sending selectedColumns to backend yet because backend extracts 'all' for domain
                    // But we could optimize later.
                })
            })
            // Redirect to PapersPage to show progress
            navigate(`/research/${id}/papers`)
        } catch (e) {
            console.error(e)
            setIsSubmitting(false)
        }
    }

    if (isLoading || !job || !schema) {
        return (
            <div style={{ padding: 48, textAlign: 'center' }}>Loading...</div>
        )
    }

    const includedCount = job.articles?.filter(a => a.screeningStatus === 'included').length || 0
    const availableColumns = Object.values(schema.columns).filter(c =>
        selectedDomain === 'all' || c.domains.includes(selectedDomain)
    )

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 48 }}>
            <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>Шаг 3: Настройка анализа</div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {job.topic}
                    </h1>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '32px auto', padding: '0 24px' }}>

                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Параметры извлечения данных</h2>
                        <div style={{ marginTop: 8, color: '#64748b', fontSize: 14 }}>
                            Будет проанализировано <b>{includedCount}</b> отобранных статей
                        </div>
                    </div>

                    <div style={{ padding: '24px' }}>

                        {/* Option 1: Knowledge Graph */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'flex', alignItems: 'start', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={extractEntities}
                                    onChange={e => setExtractEntities(e.target.checked)}
                                    style={{ marginTop: 4, marginRight: 12, width: 18, height: 18 }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Построить граф знаний</div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                                        Автоматически извлекает сущности (белки, гены, лекарства) и связи между ними из полного текста.
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div style={{ height: 1, background: '#e2e8f0', marginBottom: 24 }} />

                        {/* Option 2: Structured Data Table */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 16 }}>
                                <input
                                    type="checkbox"
                                    checked={extractColumns}
                                    onChange={e => setExtractColumns(e.target.checked)}
                                    style={{ marginRight: 12, width: 18, height: 18 }}
                                />
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>Извлечь таблицу данных</span>
                            </label>

                            {extractColumns && (
                                <div style={{ marginLeft: 30, background: '#f1f5f9', padding: 16, borderRadius: 8 }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                                            Область знаний (шаблон колонок)
                                        </label>
                                        <select
                                            value={selectedDomain}
                                            onChange={e => setSelectedDomain(e.target.value)}
                                            style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                                        >
                                            <option value="all">Все колонки</option>
                                            {schema.domains?.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        {availableColumns.map(col => (
                                            <label key={col.id} style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#334155' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedColumns.includes(col.id)}
                                                    disabled={col.required}
                                                    onChange={e => {
                                                        if (e.target.checked) setSelectedColumns([...selectedColumns, col.id])
                                                        else setSelectedColumns(selectedColumns.filter(id => id !== col.id))
                                                    }}
                                                    style={{ marginRight: 8 }}
                                                />
                                                {col.name}
                                                {col.required && <span style={{ marginLeft: 4, color: '#ef4444' }}>*</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleStartAnalysis}
                    disabled={isSubmitting || (!extractEntities && !extractColumns)}
                    style={{
                        width: '100%',
                        marginTop: 24,
                        padding: '18px',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 14,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: (isSubmitting || (!extractEntities && !extractColumns)) ? 'not-allowed' : 'pointer',
                        opacity: (isSubmitting || (!extractEntities && !extractColumns)) ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? 'Запуск анализа...' : '🚀 Запустить анализ'}
                </button>

            </main>
        </div>
    )
}
