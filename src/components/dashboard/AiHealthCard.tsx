
import { Card } from '@/components/ui/Card'
import { Zap, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface AIHealth {
    available: boolean
    model?: string
    provider?: string
    error?: string
}

interface AiHealthCardProps {
    data: AIHealth | null
}

export const AiHealthCard = ({ data }: AiHealthCardProps) => {
    return (
        <Card className="p-8 group hover:border-plasma/20 transition-all duration-500 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-void rounded-lg border border-ash/20 text-steel-dim group-hover:text-plasma group-hover:border-plasma/30 transition-colors">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h6 className="text-steel">Интеллект (AI)</h6>
                </div>
                {data && (data.available ?
                    <CheckCircle className="w-6 h-6 text-green-500 shadow-glow-green" /> :
                    <XCircle className="w-6 h-6 text-red-500 shadow-glow-red" />
                )}
            </div>
            <p className="text-[10px] text-steel-dim font-bold uppercase mb-4 opacity-60">Доступность LLM сервисов</p>
            {data ? (
                <div className="space-y-4 font-mono">
                    <div className="flex justify-between items-center group/item">
                        <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Доступность</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded bg-void border border-ash/10 ${data.available ? 'text-green-600' : 'text-red-500'}`}>
                            {data.available ? 'ОНЛАЙН' : 'ОФФЛАЙН'}
                        </span>
                    </div>
                    {data.model && (
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Активная модель</span>
                            <span className="text-sm text-steel font-bold bg-void px-2 py-0.5 rounded border border-ash/10 uppercase tracking-tighter">
                                {data.model}
                            </span>
                        </div>
                    )}
                    {data.provider && (
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[10px] text-steel-dim uppercase tracking-widest font-bold">Провайдер</span>
                            <span className="text-xs text-plasma font-bold bg-plasma/5 px-2 py-0.5 rounded border border-plasma/20 uppercase">
                                {data.provider}
                            </span>
                        </div>
                    )}
                    {data.error && (
                        <div className="mt-4 p-4 bg-plasma/10 border border-plasma/20 rounded-lg space-y-2">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-plasma shrink-0 mt-0.5" />
                                <div className="text-[10px] text-plasma font-bold uppercase tracking-widest leading-relaxed">
                                    {data.error}
                                </div>
                            </div>
                            {!data.available && (
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
    )
}
