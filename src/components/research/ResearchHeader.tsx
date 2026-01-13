
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ResearchJob } from '../../../shared/contracts/research'
import ThinkingTerminal from '@/components/ThinkingTerminal'

interface Props {
    job: ResearchJob | null
}

export function ResearchHeader({ job }: Props) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const isInProgress = (status: string) =>
        ['pending', 'searching', 'downloading', 'analyzing', 'processing'].includes(status)

    return (
        <>
            <div className="border-b border-ash/10 pb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-steel-dim hover:text-acid mb-4 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> {t('common.back')}
                </Button>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div>
                        <h1 className="mb-2 text-steel text-3xl font-bold tracking-tight">
                            {t('papers.topic_prefix')} <span className="text-acid">{job?.topic}</span>
                        </h1>
                        <div className="flex items-center gap-4 text-sm font-medium text-steel-dim">
                            <span className="bg-zinc-100 px-3 py-1 rounded-md border border-ash/40">
                                {t('papers.status_prefix')} {job?.status === 'completed' ? t('papers.completed') : t('papers.processing')}
                            </span>
                            <span className="text-sm">
                                {job?.articlesFound} {t('papers.records_found')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            {isInProgress(job?.status || '') && (
                <div className="glass-panel border-ash/20 p-8 rounded-xl space-y-6 mb-8">
                    <ThinkingTerminal jobId={job?.id || ''} status={job?.status || ''} />
                    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-acid transition-all duration-300 relative"
                            style={{ width: `${job?.progress || 10}%` }}
                        />
                    </div>
                </div>
            )}
        </>
    )
}
