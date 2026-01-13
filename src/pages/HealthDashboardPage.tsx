import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SystemHealthCard } from '@/components/dashboard/SystemHealthCard'
import { AiHealthCard } from '@/components/dashboard/AiHealthCard'
import { CacheStatsCard } from '@/components/dashboard/CacheStatsCard'
import { MemoryUsageCard } from '@/components/dashboard/MemoryUsageCard'

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
                    <SystemHealthCard data={systemHealth} />
                    <AiHealthCard data={aiHealth} />
                    <CacheStatsCard data={cacheStats} />
                </div>

                {/* Memory Usage Bar */}
                <MemoryUsageCard data={systemHealth} />
            </div>
        </div>
    )
}
