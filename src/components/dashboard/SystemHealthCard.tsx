
import { Card } from '@/components/ui/Card'
import { Cpu, Loader2, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react'

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

interface SystemHealthCardProps {
    data: HealthStatus | null
}

export const SystemHealthCard = ({ data }: SystemHealthCardProps) => {
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
        <Card className="p-8 group hover:border-acid/20 transition-all duration-500 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-void rounded-lg border border-ash/20 text-steel-dim group-hover:text-acid group-hover:border-acid/30 transition-colors">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <h6 className="text-steel">Сервер (Core)</h6>
                </div>
                {data && getStatusIcon(data.status)}
            </div>
            <p className="text-[10px] text-steel-dim font-bold uppercase mb-4 opacity-60">Мониторинг ресурсов Node.js</p>
            {data ? (
                <div className="space-y-4 font-mono">
                    <div className="flex justify-between items-center group/item">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Статус ядра</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded bg-void border border-ash/10 ${getStatusColor(data.status)}`}>
                            {data.status === 'healthy' ? 'СТАБИЛЬНО' :
                                data.status === 'degraded' ? 'ЗАМЕДЛЕН' : 'КРИТИЧЕСКАЯ ОШИБКА'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Время работы</span>
                        <span className="text-sm text-steel font-bold">{formatUptime(data.uptime)}</span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Память (Heap)</span>
                        <span className="text-sm text-steel font-bold">
                            {formatBytes(data.memory.heapUsed)} / {formatBytes(data.memory.heapTotal)}
                        </span>
                    </div>
                    {data.issues.length > 0 && (
                        <div className="mt-4 p-3 bg-plasma/10 border border-plasma/20 rounded text-[10px] text-plasma font-bold uppercase tracking-widest">
                            ANOMALY_DETECTED: {data.issues.join(', ')}
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
    )
}
