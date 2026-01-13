import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/services/api'

// Types (should be shared)
interface Gap {
  id: string
  source: string
  target: string
  score: number
  reason: string
  type: 'missing_link' | 'potential_cluster' | 'contradiction'
}

export default function ResearchGapsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [gaps, setGaps] = useState<Gap[]>([])
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Job to find graphId
        const jobRes = await fetch(`http://localhost:3002/api/research/jobs/${id}`, {
          headers: { 'Authorization': `Bearer local-admin` }
        })
        const jobData = await jobRes.json()
        setJob(jobData.job)

        if (jobData.job.graphId) {
          // 2. Get Gaps
          const gapsRes = await fetch(`http://localhost:3002/api/analysis/gaps/${jobData.job.graphId}`, {
            method: 'POST', // Trigger analysis
            headers: { 'Authorization': `Bearer local-admin` }
          })
          const gapsData = await gapsRes.json()
          setGaps(gapsData.gaps || [])
        }
      } catch (err) {
        console.error('Failed to fetch gaps', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  return (
    <div className="min-h-screen bg-void text-steel-light p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-steel hover:text-white">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-plasma to-acid">
              Research Gap Analysis
            </h1>
            <p className="text-steel-dim mt-1">
              AI-identified missing links and structural opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-20 text-steel animate-pulse">
            Analyzing graph topology...
          </div>
        ) : gaps.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-xl">
            <AlertCircle className="w-12 h-12 text-steel-dim mx-auto mb-4" />
            <h3 className="text-xl font-medium text-steel">No significant gaps found</h3>
            <p className="text-steel-dim mt-2">The graph appears well-connected or dense.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {gaps.map((gap, idx) => (
              <div key={gap.id} className="glass-panel p-6 rounded-xl border border-ash/10 hover:border-acid/30 transition-all group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-acid/10 flex items-center justify-center text-acid font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-white">Missing Link</span>
                        <span className="px-2 py-0.5 rounded-full bg-ash/20 text-xs font-mono text-acid">
                          Score: {gap.score.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-steel-dim text-sm mb-3">
                        {gap.reason}
                      </p>
                      <div className="flex items-center gap-3 text-sm font-medium text-steel">
                        <span className="bg-ash/20 px-2 py-1 rounded hover:text-white cursor-pointer">
                          {gap.source} // TODO: resolve label
                        </span>
                        <ArrowLeft className="w-4 h-4 rotate-180 text-ash" />
                        <span className="bg-ash/20 px-2 py-1 rounded hover:text-white cursor-pointer">
                          {gap.target} // TODO: resolve label
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Zap size={14} className="mr-2" />
                    Explore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
