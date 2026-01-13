
import { Card } from '@/components/ui/Card'
import { Database, HardDrive, Loader2 } from 'lucide-react'

interface CacheStats {
    size: number
    hits: number
    misses: number
    hitRate: string
    sizeInBytes: number
}

interface CacheStatsCardProps {
    data: CacheStats | null
}

export const CacheStatsCard = ({ data }: CacheStatsCardProps) => {
    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
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
            {data ? (
                <div className="space-y-4 font-mono">
                    <div className="flex justify-between items-center group/item">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Записей</span>
                        <span className="text-sm text-steel font-bold">{data.size} OBJ</span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Эффективность</span>
                        <span className="text-sm text-acid font-bold bg-acid/5 px-2 py-0.5 rounded border border-acid/10">{data.hitRate}</span>
                    </div>
                    <div className="flex justify-between items-center group/item">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Попадания / Пропуски</span>
                        <span className="text-sm text-steel font-bold">{data.hits} / {data.misses}</span>
                    </div>
                    <div className="flex justify-between items-center group/item pt-2 border-t border-ash/10">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Вес реестра</span>
                        <span className="text-sm text-steel font-bold">{formatBytes(data.sizeInBytes)}</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="w-8 h-8 text-white/10 animate-spin mb-2" />
                    <p className="text-[10px] font-mono text-steel/40 italic">AWAITING_REGISTRY_LOCK...</p>
                </div>
            )}
        </Card>
    )
}
