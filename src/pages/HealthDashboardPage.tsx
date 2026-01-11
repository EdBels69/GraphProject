import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Activity, Database, Cpu, HardDrive, Zap, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    uptime: number
    memory: {
        heapUsed: number
        heapTotal: number
        rss: number
    }
    issues: string[]
}

interface AIHealth {
    available: boolean
    model?: string
    provider?: string
    error?: string
}

interface CacheStats {
    size: number
    hits: number
    misses: number
    hitRate: string
    sizeInBytes: number
}

export default function HealthDashboardPage() {
    const [systemHealth, setSystemHealth] = useState<HealthStatus | null>(null)
    const [aiHealth, setAiHealth] = useState<AIHealth | null>(null)
    const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    const fetchHealth = async () => {
        setLoading(true)
        try {
            const [systemRes, aiRes, cacheRes] = await Promise.allSettled([
                fetch('/api/system/health').then(r => r.json()),
                fetch('/api/ai/health').then(r => r.json()),
                fetch('/api/system/cache/stats').then(r => r.json())
            ])

            if (systemRes.status === 'fulfilled') setSystemHealth(systemRes.value)
            if (aiRes.status === 'fulfilled') setAiHealth(aiRes.value)
            if (cacheRes.status === 'fulfilled') setCacheStats(cacheRes.value)

            setLastRefresh(new Date())
        } catch (error) {
            console.error('Health check failed:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHealth()
        const interval = setInterval(fetchHealth, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}H ${minutes}M`
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-500'
            case 'degraded': return 'text-yellow-500'
            case 'unhealthy': return 'text-red-500'
            default: return 'text-gray-500'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="w-6 h-6 text-green-500" />
            case 'degraded': return <AlertTriangle className="w-6 h-6 text-yellow-500" />
            case 'unhealthy': return <XCircle className="w-6 h-6 text-red-500" />
            default: return <Activity className="w-6 h-6 text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-void p-6 animate-fade-in">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6">
                        <Link to="/">
                            <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-widest text-steel-dim">
                                <ArrowLeft className="w-3 h-3 mr-2" />
                                ВЕРНУТЬСЯ НА ГЛАВНУЮ
                            </Button>
                        </Link>
                        <div>
                            <h1 className="mb-2">
                                Состояние системы
                            </h1>
                            <p className="text-xs font-bold text-steel-dim uppercase tracking-widest">
                                ПОСЛЕДНЕЕ СКАНИРОВАНИЕ: {lastRefresh.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={fetchHealth}
                        disabled={loading}
                        className="font-mono text-xs tracking-widest"
                    >
                        <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        RESCAN_SYSTEM
                    </Button>
                </div>

                {/* Main Status Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* System Health Card */}
                    <Card className="p-8 group hover:border-acid/20 transition-all duration-500 bg-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-void rounded-lg border border-ash/20 text-steel-dim group-hover:text-acid group-hover:border-acid/30 transition-colors">
                                    <Cpu className="w-6 h-6" />
                                </div>
                                <h6 className="text-steel">Сервер (Core)</h6>
                            </div>
                            {systemHealth && getStatusIcon(systemHealth.status)}
                        </div>
                        <p className="text-[10px] text-steel-dim font-bold uppercase mb-4 opacity-60">Мониторинг ресурсов Node.js</p>
                        {systemHealth ? (
                            <div className="space-y-4 font-mono">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Статус ядра</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded bg-void border border-ash/10 ${getStatusColor(systemHealth.status)}`}>
                                        {systemHealth.status === 'healthy' ? 'СТАБИЛЬНО' :
                                            systemHealth.status === 'degraded' ? 'ЗАМЕДЛЕН' : 'КРИТИЧЕСКАЯ ОШИБКА'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Время работы</span>
                                    <span className="text-sm text-steel font-bold">{formatUptime(systemHealth.uptime)}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Память (Heap)</span>
                                    <span className="text-sm text-steel font-bold">
                                        {formatBytes(systemHealth.memory.heapUsed)} / {formatBytes(systemHealth.memory.heapTotal)}
                                    </span>
                                </div>
                                {systemHealth.issues.length > 0 && (
                                    <div className="mt-4 p-3 bg-plasma/10 border border-plasma/20 rounded text-[10px] text-plasma font-bold uppercase tracking-widest">
                                        ANOMALY_DETECTED: {systemHealth.issues.join(', ')}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Loader2 className="w-8 h-8 text-white/10 animate-spin mb-2" />
                                <p className="text-[10px] font-mono text-steel/40 italic">AWAITING_CORE_STREAM...</p>
                            </div>
                        )}
                    </Card>

                    {/* AI Service Card */}
                    <Card className="p-8 group hover:border-plasma/20 transition-all duration-500 bg-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-void rounded-lg border border-ash/20 text-steel-dim group-hover:text-plasma group-hover:border-plasma/30 transition-colors">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h6 className="text-steel">Интеллект (AI)</h6>
                            </div>
                            {aiHealth && (aiHealth.available ?
                                <CheckCircle className="w-6 h-6 text-green-500 shadow-glow-green" /> :
                                <XCircle className="w-6 h-6 text-red-500 shadow-glow-red" />
                            )}
                        </div>
                        <p className="text-[10px] text-steel-dim font-bold uppercase mb-4 opacity-60">Доступность LLM сервисов</p>
                        {aiHealth ? (
                            <div className="space-y-4 font-mono">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Доступность</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded bg-void border border-ash/10 ${aiHealth.available ? 'text-green-600' : 'text-red-500'}`}>
                                        {aiHealth.available ? 'ОНЛАЙН' : 'ОФФЛАЙН'}
                                    </span>
                                </div>
                                {aiHealth.model && (
                                    <div className="flex justify-between items-center group/item">
                                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Активная модель</span>
                                        <span className="text-sm text-steel font-bold bg-void px-2 py-0.5 rounded border border-ash/10 uppercase tracking-tighter">
                                            {aiHealth.model}
                                        </span>
                                    </div>
                                )}
                                {aiHealth.provider && (
                                    <div className="flex justify-between items-center group/item">
                                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Провайдер</span>
                                        <span className="text-xs text-plasma font-bold bg-plasma/5 px-2 py-0.5 rounded border border-plasma/20 uppercase">
                                            {aiHealth.provider}
                                        </span>
                                    </div>
                                )}
                                {aiHealth.error && (
                                    <div className="mt-4 p-4 bg-plasma/10 border border-plasma/20 rounded-lg space-y-2">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-plasma shrink-0 mt-0.5" />
                                            <div className="text-[10px] text-plasma font-bold uppercase tracking-widest leading-relaxed">
                                                {aiHealth.error}
                                            </div>
                                        </div>
                                        {!aiHealth.available && (
                                            <div className="pt-2 border-t border-plasma/10">
                                                <p className="text-[9px] text-steel-dim font-bold uppercase tracking-tighter mb-1">Рекомендации:</p>
                                                <ul className="text-[9px] text-steel list-disc pl-3 space-y-1">
                                                    <li>Проверьте, запущен ли Ollama или LM Studio</li>
                                                    <li>Убедитесь, что порт (9001, 11434 или 1234) открыт</li>
                                                    <li>Проверьте наличие OPENAI_API_KEY в файле .env</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Loader2 className="w-8 h-8 text-white/10 animate-spin mb-2" />
                                <p className="text-[10px] font-mono text-steel/40 italic">AWAITING_AI_SYNC...</p>
                            </div>
                        )}
                    </Card>

                    {/* Cache Stats Card */}
                    <Card className="p-8 group hover:border-acid/20 transition-all duration-500 bg-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-void rounded-lg border border-ash/20 text-steel-dim group-hover:text-acid group-hover:border-acid/30 transition-colors">
                                    <Database className="w-6 h-6" />
                                </div>
                                <h6 className="text-steel">Кэш-память</h6>
                            </div>
                            <HardDrive className="w-6 h-6 text-ash/30" />
                        </div>
                        <p className="text-[10px] text-steel-dim font-bold uppercase mb-4 opacity-60">Оптимизация повторных запросов</p>
                        {cacheStats ? (
                            <div className="space-y-4 font-mono">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Записей</span>
                                    <span className="text-sm text-steel font-bold">{cacheStats.size} OBJ</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Эффективность</span>
                                    <span className="text-sm text-acid font-bold bg-acid/5 px-2 py-0.5 rounded border border-acid/10">{cacheStats.hitRate}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Попадания / Пропуски</span>
                                    <span className="text-sm text-steel font-bold">{cacheStats.hits} / {cacheStats.misses}</span>
                                </div>
                                <div className="flex justify-between items-center group/item pt-2 border-t border-ash/10">
                                    <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Вес реестра</span>
                                    <span className="text-sm text-steel font-bold">{formatBytes(cacheStats.sizeInBytes)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Loader2 className="w-8 h-8 text-white/10 animate-spin mb-2" />
                                <p className="text-[10px] font-mono text-steel/40 italic">AWAITING_REGISTRY_LOCK...</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Memory Usage Bar */}
                {systemHealth && (
                    <Card className="p-8 border-ash/20 bg-white shadow-lg">
                        <h5 className="mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-acid" /> Телеметрия оперативной памяти
                        </h5>
                        <p className="text-[10px] text-steel-dim font-bold uppercase mb-8 opacity-60">
                            Критический мониторинг для рендеринга больших графов и PDF-парсинга
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-mono">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Нагрузка Heap</span>
                                        <span className="text-xs text-steel font-bold">Node.js Isolate Runtime</span>
                                    </div>
                                    <span className="text-[10px] text-steel-dim font-bold">
                                        {formatBytes(systemHealth.memory.heapUsed)} / {formatBytes(systemHealth.memory.heapTotal)}
                                    </span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                                    <div
                                        className="bg-acid h-full rounded-full transition-all duration-1000 shadow-glow-acid"
                                        style={{ width: `${(systemHealth.memory.heapUsed / systemHealth.memory.heapTotal) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Resident Set Size (RSS)</span>
                                        <span className="text-xs text-steel font-bold">Общее резервирование системы</span>
                                    </div>
                                    <span className="text-[10px] text-steel-dim font-bold">{formatBytes(systemHealth.memory.rss)}</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                                    <div
                                        className="bg-purple-500 h-full rounded-full transition-all duration-1000 shadow-glow-purple"
                                        style={{ width: `${Math.min(100, (systemHealth.memory.rss / (1024 * 1024 * 512)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
