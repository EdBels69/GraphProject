import { useState, useEffect } from 'react'
import { ResearchJob } from '../../shared/contracts/research'
import { useApi } from './useApi'
import { API_ENDPOINTS } from '../api/endpoints'
import { socketService } from '../services/socket'

export function useResearchJob(id: string | undefined) {
    const { data: jobData, loading: initialLoading, refetch } = useApi<{ job: ResearchJob }>(
        id ? API_ENDPOINTS.RESEARCH.JOBS(id) : ''
    )

    const [job, setJob] = useState<ResearchJob | null>(null)

    useEffect(() => {
        if (jobData?.job) {
            setJob(jobData.job)
        }
    }, [jobData])

    // Socket subscription
    useEffect(() => {
        if (!id) return

        const handleProgress = (data: any) => {
            if (data.jobId === id) {
                // Optimistic update for progress/status
                setJob((prev: ResearchJob | null) => prev ? { ...prev, status: data.status || prev.status, progress: data.progress } : null)

                // Refetch to get full data (articles found, logs, etc)
                // Debounce could be added here if updates are too frequent, but usually acceptable
                refetch()
            }
        }

        socketService.joinJob(id)
        socketService.onJobProgress(handleProgress)

        return () => {
            socketService.leaveJob(id)
            socketService.offJobProgress(handleProgress)
        }
    }, [id, refetch])

    return {
        job,
        setJob,
        isLoading: initialLoading && !job,
        refetch
    }
}
