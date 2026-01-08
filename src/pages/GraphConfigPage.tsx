import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface GraphConfig {
    // Node filters
    nodeTypes: {
        Gene: boolean
        Protein: boolean
        Metabolite: boolean
        Disease: boolean
        Drug: boolean
        Pathway: boolean
        Concept: boolean
    }
    minConfidence: number
    minMentions: number

    // Edge settings
    edgeMethod: 'ai' | 'cooccurrence' | 'both'
    edgeMinConfidence: number

    // Layout
    layout: 'force' | 'hierarchical' | 'circular' | 'clustered'
}

interface EntityPreview {
    jobId: string
    entityCount: number
    relationCount: number
    entityStats: Record<string, number>
    entities: Array<{ id: string; name: string; type: string; confidence: number; mentions: number }>
    relations: Array<{ source: string; target: string; type: string }>
}

const defaultConfig: GraphConfig = {
    nodeTypes: {
        Gene: true,
        Protein: true,
        Metabolite: true,
        Disease: true,
        Drug: true,
        Pathway: false,
        Concept: true
    },
    minConfidence: 0.3,
    minMentions: 1,
    edgeMethod: 'both',
    edgeMinConfidence: 0.3,
    layout: 'force'
}

export default function GraphConfigPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [config, setConfig] = useState<GraphConfig>(defaultConfig)
    const [isBuilding, setIsBuilding] = useState(false)
    const [jobInfo, setJobInfo] = useState<{ topic: string; articlesFound: number } | null>(null)
    const [preview, setPreview] = useState<EntityPreview | null>(null)
    const [previewLoading, setPreviewLoading] = useState(true)

    useEffect(() => {
        fetchJobInfo()
        fetchEntityPreview()
    }, [id])

    const fetchJobInfo = async () => {
        try {
            const response = await fetch(`/api/research/jobs/${id}`)
            if (response.ok) {
                const data = await response.json()
                setJobInfo({ topic: data.job?.topic, articlesFound: data.job?.articlesFound || 0 })
            }
        } catch (error) {
            console.error('Failed to fetch job:', error)
        }
    }

    const fetchEntityPreview = async () => {
        try {
            const response = await fetch(`/api/research/jobs/${id}/entities`)
            if (response.ok) {
                const data = await response.json()
                setPreview(data)
            }
        } catch (error) {
            console.error('Failed to fetch entities:', error)
        } finally {
            setPreviewLoading(false)
        }
    }

    const handleBuildGraph = async () => {
        setIsBuilding(true)
        try {
            const response = await fetch(`/api/research/jobs/${id}/build-graph`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config })
            })
            const data = await response.json()
            if (data.graphId) {
                navigate(`/research/${id}/graph`)
            } else if (data.error) {
                alert(`Ошибка: ${data.error}`)
            }
        } catch (error) {
            console.error('Failed to build graph:', error)
        } finally {
            setIsBuilding(false)
        }
    }

    const toggleNodeType = (type: keyof GraphConfig['nodeTypes']) => {
        setConfig(prev => ({
            ...prev,
            nodeTypes: { ...prev.nodeTypes, [type]: !prev.nodeTypes[type] }
        }))
    }

    const nodeTypeLabels: Record<keyof GraphConfig['nodeTypes'], { emoji: string; label: string }> = {
        Gene: { emoji: '🧬', label: 'Гены' },
        Protein: { emoji: '🔷', label: 'Белки' },
        Metabolite: { emoji: '⚗️', label: 'Метаболиты' },
        Disease: { emoji: '🏥', label: 'Болезни' },
        Drug: { emoji: '💊', label: 'Препараты' },
        Pathway: { emoji: '🛤️', label: 'Пути' },
        Concept: { emoji: '💡', label: 'Концепты' }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <header style={{
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
                padding: '16px 24px'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                        onClick={() => navigate(`/research/${id}/papers`)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'none', border: 'none',
                            color: '#64748b', fontSize: 14, cursor: 'pointer'
                        }}
                    >
                        ← К статьям
                    </button>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>Шаг 3: Конфигурация графа</div>
                </div>
            </header>

            {/* Content */}
            <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
                {jobInfo && (
                    <div style={{ marginBottom: 32, textAlign: 'center' }}>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                            ⚙️ Настройка графа
                        </h1>
                        <p style={{ color: '#64748b' }}>
                            {jobInfo.topic} • {jobInfo.articlesFound} статей
                        </p>
                    </div>
                )}

                {/* Entity Preview Section */}
                <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
                        📊 Извлечённые данные (preview)
                    </h2>

                    {previewLoading ? (
                        <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>⏳ Загрузка...</div>
                    ) : preview && preview.entityCount > 0 ? (
                        <>
                            {/* Stats */}
                            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                                <div style={{ padding: '12px 20px', background: '#f0fdf4', borderRadius: 12, flex: '1 1 150px' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{preview.entityCount}</div>
                                    <div style={{ fontSize: 13, color: '#166534' }}>Сущностей</div>
                                </div>
                                <div style={{ padding: '12px 20px', background: '#eff6ff', borderRadius: 12, flex: '1 1 150px' }}>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb' }}>{preview.relationCount}</div>
                                    <div style={{ fontSize: 13, color: '#1e40af' }}>Связей</div>
                                </div>
                                {Object.entries(preview.entityStats).slice(0, 4).map(([type, count]) => (
                                    <div key={type} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 12, flex: '0 0 auto' }}>
                                        <div style={{ fontSize: 18, fontWeight: 600, color: '#475569' }}>{count}</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>{type}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Entity Table Preview */}
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Сущность</th>
                                            <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Тип</th>
                                            <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Confidence</th>
                                            <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Mentions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.entities.slice(0, 10).map((entity, i) => (
                                            <tr key={entity.id || i} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{entity.name}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#e0e7ff', color: '#3730a3' }}>
                                                        {entity.type || 'Concept'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                                                    {((entity.confidence || 0.5) * 100).toFixed(0)}%
                                                </td>
                                                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>
                                                    {entity.mentions || 1}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.entities.length > 10 && (
                                    <div style={{ padding: '10px 12px', background: '#f8fafc', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                                        ... и ещё {preview.entities.length - 10} сущностей
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                            <div>Данные не найдены. Возможно, исследование ещё не завершено.</div>
                        </div>
                    )}
                </section>

                {/* Node Types */}
                <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
                        📍 Типы узлов
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
                        Выберите, какие типы сущностей включить в граф
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                        {(Object.keys(config.nodeTypes) as Array<keyof GraphConfig['nodeTypes']>).map(type => (
                            <button
                                key={type}
                                onClick={() => toggleNodeType(type)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    border: config.nodeTypes[type] ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                                    background: config.nodeTypes[type] ? '#eff6ff' : '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>{nodeTypeLabels[type].emoji}</span>
                                <span style={{ fontWeight: 500, color: config.nodeTypes[type] ? '#1e40af' : '#64748b' }}>
                                    {nodeTypeLabels[type].label}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <label style={{ display: 'block', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                            Мин. уверенность: {config.minConfidence.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.minConfidence}
                            onChange={(e) => setConfig(prev => ({ ...prev, minConfidence: parseFloat(e.target.value) }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                </section>

                {/* Edge Method */}
                <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
                        🔗 Метод извлечения связей
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { value: 'ai', label: 'AI Extraction (GLM-4.7)', desc: 'Точнее, но медленнее' },
                            { value: 'cooccurrence', label: 'Co-occurrence', desc: 'Быстро, но больше шума' },
                            { value: 'both', label: 'AI + Co-occurrence fallback', desc: 'Рекомендуется' }
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setConfig(prev => ({ ...prev, edgeMethod: option.value as GraphConfig['edgeMethod'] }))}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 20px',
                                    borderRadius: 12,
                                    border: config.edgeMethod === option.value ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                                    background: config.edgeMethod === option.value ? '#eff6ff' : '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500, color: config.edgeMethod === option.value ? '#1e40af' : '#1e293b' }}>
                                        {option.label}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{option.desc}</div>
                                </div>
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%',
                                    border: config.edgeMethod === option.value ? '6px solid #3b82f6' : '2px solid #cbd5e1',
                                    background: '#fff'
                                }} />
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <label style={{ display: 'block', fontSize: 14, color: '#64748b', marginBottom: 8 }}>
                            Мин. confidence для связей: {config.edgeMinConfidence.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.edgeMinConfidence}
                            onChange={(e) => setConfig(prev => ({ ...prev, edgeMinConfidence: parseFloat(e.target.value) }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                </section>

                {/* Layout */}
                <section style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 32, border: '1px solid #e2e8f0' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
                        📐 Layout (визуализация)
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {[
                            { value: 'force', label: 'Force-directed', emoji: '🌐' },
                            { value: 'hierarchical', label: 'Hierarchical', emoji: '🌳' },
                            { value: 'circular', label: 'Circular', emoji: '⭕' },
                            { value: 'clustered', label: 'Clustered', emoji: '🔵' }
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setConfig(prev => ({ ...prev, layout: option.value as GraphConfig['layout'] }))}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '16px 20px',
                                    borderRadius: 12,
                                    border: config.layout === option.value ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                                    background: config.layout === option.value ? '#eff6ff' : '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontSize: 24 }}>{option.emoji}</span>
                                <span style={{ fontWeight: 500, color: config.layout === option.value ? '#1e40af' : '#1e293b' }}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Build Button */}
                <button
                    onClick={handleBuildGraph}
                    disabled={isBuilding}
                    style={{
                        width: '100%',
                        padding: '18px',
                        background: isBuilding ? '#94a3b8' : '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 14,
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: isBuilding ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isBuilding ? '⏳ Строим граф...' : '🚀 Построить граф →'}
                </button>
            </main>
        </div>
    )
}
