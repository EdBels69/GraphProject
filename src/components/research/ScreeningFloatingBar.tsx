
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/contexts/ToastContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResearchJob } from '../../../shared/contracts/research'

interface Props {
    job: ResearchJob
    onSaveSuccess: () => void
}

export function ScreeningFloatingBar({ job, onSaveSuccess }: Props) {
    const { t } = useTranslation()
    const { addToast } = useToast()
    const navigate = useNavigate()
    const [actionLoading, setActionLoading] = useState(false)

    const handleSave = async () => {
        setActionLoading(true)
        const includedIds = job.articles!.filter((a: any) => a.screeningStatus === 'included').map((a: any) => a.id)
        const excludedIds = job.articles!.filter((a: any) => a.screeningStatus === 'excluded').map((a: any) => a.id)

        try {
            const response = await fetch(`/api/research/jobs/${job.id}/screening`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ includedIds, excludedIds })
            })
            if (response.ok) {
                onSaveSuccess()
            } else {
                addToast(t('papers.save_error'), 'error')
            }
        } catch (e) {
            console.error(e)
            addToast(t('papers.network_error'), 'error')
        } finally {
            setActionLoading(false)
        }
    }

    if (job.status !== 'completed') return null

    const hasIncluded = job.articles?.some((a: any) => a.screeningStatus === 'included')

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
            <Button
                variant="primary"
                size="lg"
                onClick={handleSave}
                disabled={actionLoading || !hasIncluded}
                className={`shadow-2xl border-2 border-void ${!hasIncluded && 'opacity-50 cursor-not-allowed'}`}
            >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                {actionLoading
                    ? t('papers.saving')
                    : `Continue with ${job.articles?.filter((a: any) => a.screeningStatus === 'included').length} Selected`
                }
            </Button>
        </div>
    )
}
