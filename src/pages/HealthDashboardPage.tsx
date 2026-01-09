import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Activity, Database, Cpu, HardDrive, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
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
        return `${hours}ч ${minutes}м`
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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                На главную
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
                            <p className="text-sm text-gray-500">
                                Последнее обновление: {lastRefresh.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    <Button onClick={fetchHealth} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                </div>

                {/* Main Status Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* System Health Card */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Cpu className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Система</h3>
                            </div>
                            {systemHealth && getStatusIcon(systemHealth.status)}
                        </div>
                        {systemHealth ? (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Статус</span>
                                    <span className={`font-medium ${getStatusColor(systemHealth.status)}`}>
                                        {systemHealth.status === 'healthy' ? 'Здоров' :
                                            systemHealth.status === 'degraded' ? 'Деградация' : 'Недоступен'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Uptime</span>
                                    <span className="font-medium">{formatUptime(systemHealth.uptime)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Heap Memory</span>
                                    <span className="font-medium">
                                        {formatBytes(systemHealth.memory.heapUsed)} / {formatBytes(systemHealth.memory.heapTotal)}
                                    </span>
                                </div>
                                {systemHealth.issues.length > 0 && (
                                    <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                                        {systemHealth.issues.join(', ')}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">Загрузка...</div>
                        )}
                    </Card>

                    {/* AI Service Card */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Zap className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold">AI Сервис</h3>
                            </div>
                            {aiHealth && (aiHealth.available ?
                                <CheckCircle className="w-6 h-6 text-green-500" /> :
                                <XCircle className="w-6 h-6 text-red-500" />
                            )}
                        </div>
                        {aiHealth ? (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Статус</span>
                                    <span className={`font-medium ${aiHealth.available ? 'text-green-500' : 'text-red-500'}`}>
                                        {aiHealth.available ? 'Доступен' : 'Недоступен'}
                                    </span>
                                </div>
                                {aiHealth.model && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Модель</span>
                                        <span className="font-medium font-mono text-xs">{aiHealth.model}</span>
                                    </div>
                                )}
                                {aiHealth.error && (
                                    <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-800">
                                        {aiHealth.error}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">Загрузка...</div>
                        )}
                    </Card>

                    {/* Cache Stats Card */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Database className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold">Кэш</h3>
                            </div>
                            <HardDrive className="w-6 h-6 text-gray-400" />
                        </div>
                        {cacheStats ? (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Записей</span>
                                    <span className="font-medium">{cacheStats.size}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Hit Rate</span>
                                    <span className="font-medium text-green-600">{cacheStats.hitRate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Hits / Misses</span>
                                    <span className="font-medium">{cacheStats.hits} / {cacheStats.misses}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Размер</span>
                                    <span className="font-medium">{formatBytes(cacheStats.sizeInBytes)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400 text-sm">Загрузка...</div>
                        )}
                    </Card>
                </div>

                {/* Memory Usage Bar */}
                {systemHealth && (
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Использование памяти</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Heap Used</span>
                                    <span>{formatBytes(systemHealth.memory.heapUsed)} / {formatBytes(systemHealth.memory.heapTotal)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all"
                                        style={{ width: `${(systemHealth.memory.heapUsed / systemHealth.memory.heapTotal) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>RSS (Total)</span>
                                    <span>{formatBytes(systemHealth.memory.rss)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-purple-500 h-3 rounded-full transition-all"
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
