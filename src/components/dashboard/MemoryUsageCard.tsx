
import { Card } from '@/components/ui/Card'
import { Activity } from 'lucide-react'

interface HealthStatus {
    memory: {
        heapUsed: number
        heapTotal: number
        rss: number
    }
}

interface MemoryUsageCardProps {
    data: HealthStatus | null
}

export const MemoryUsageCard = ({ data }: MemoryUsageCardProps) => {
    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    if (!data) return null

    return (
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
                            {formatBytes(data.memory.heapUsed)} / {formatBytes(data.memory.heapTotal)}
                        </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div
                            className="bg-acid h-full rounded-full transition-all duration-1000 shadow-glow-acid"
                            style={{ width: `${(data.memory.heapUsed / data.memory.heapTotal) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Resident Set Size (RSS)</span>
                            <span className="text-xs text-steel font-bold">Общее резервирование системы</span>
                        </div>
                        <span className="text-[10px] text-steel-dim font-bold">{formatBytes(data.memory.rss)}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div
                            className="bg-purple-500 h-full rounded-full transition-all duration-1000 shadow-glow-purple"
                            style={{ width: `${Math.min(100, (data.memory.rss / (1024 * 1024 * 512)) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
