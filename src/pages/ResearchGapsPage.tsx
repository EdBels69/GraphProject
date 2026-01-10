import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { useApi } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Search,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  ArrowLeft,
  Info,
  Layers,
  Zap,
  ShieldCheck,
  BookOpen,
  X
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface ResearchGap {
  id: string;
  area: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  supportingEvidence: number;
  recommendation: string;
  createdAt: string;
}

export default function ResearchGapsPage() {
  const { addToast } = useToast()

  const [gaps, setGaps] = useState<ResearchGap[]>([
    {
      id: '1',
      area: 'P53-Metabolism Linkage in Oncogenesis',
      priority: 'high',
      confidence: 0.78,
      supportingEvidence: 12,
      recommendation: 'Initiate meta-analysis on metabolic reprogramming in P53-driven tumors. Investigate P53 regulation of glycolysis, TCA cycle, and fatty acid oxidation to identify therapeutic vulnerabilities.',
      createdAt: '2024-12-15'
    },
    {
      id: '2',
      area: 'MAPK/PI3K Cross-Resistance Mechanisms',
      priority: 'critical',
      confidence: 0.85,
      supportingEvidence: 23,
      recommendation: 'Investigate compensatory PI3K activation during MAPK pathway inhibition. Identify shared downstream targets and evaluate synergistic effects of combination therapies.',
      createdAt: '2024-12-15'
    },
    {
      id: '3',
      area: 'Non-coding RNA in Apoptosis Regulation',
      priority: 'medium',
      confidence: 0.62,
      supportingEvidence: 8,
      recommendation: 'Systematic analysis of miRNA and lncRNA targeting apoptotic pathways. Identify miRNAs co-regulating multiple pro- and anti-apoptotic genes for integral regulation models.',
      createdAt: '2024-12-15'
    },
    {
      id: '4',
      area: 'Molecular Mechanisms of Immune Evolution',
      priority: 'high',
      confidence: 0.71,
      supportingEvidence: 15,
      recommendation: 'Analyze dynamics of immune checkpoint expression (PD-1, PD-L1) under selective pressure. Evaluate combination of immunotherapy with targeted agents.',
      createdAt: '2024-12-15'
    },
  ])

  const [filter, setFilter] = useState<'all' | 'high' | 'critical'>('all')
  const [sort, setSort] = useState<'priority' | 'confidence' | 'evidence'>('priority')
  const [selectedGap, setSelectedGap] = useState<ResearchGap | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const priorityColors = {
    low: 'bg-white/5 text-steel/60 border-white/10',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-plasma/10 text-plasma border-plasma/20',
    critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  const priorityLabels = {
    low: 'LOW_PRIORITY',
    medium: 'STANDARD_PRIORITY',
    high: 'HIGH_PRIORITY',
    critical: 'CRITICAL_FAILURE_RISK',
  }

  const filteredGaps = gaps.filter(gap => {
    if (filter === 'high') return gap.priority === 'high' || gap.priority === 'critical'
    if (filter === 'critical') return gap.priority === 'critical'
    return true
  })

  const sortedGaps = [...filteredGaps].sort((a, b) => {
    if (sort === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    if (sort === 'confidence') return b.confidence - a.confidence
    if (sort === 'evidence') return b.supportingEvidence - a.supportingEvidence
    return 0
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight mb-2">
            RESEARCH_GAPS_IDENTIFIED
          </h1>
          <p className="text-sm font-mono text-steel/60 italic uppercase tracking-widest">Knowledge Incompleteness Audit Alpha</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-acid outline-none transition-all"
          >
            <option value="all" className="bg-void">ALL_PRIORITIES</option>
            <option value="high" className="bg-void">HIGH_AND_CRITICAL</option>
            <option value="critical" className="bg-void">CRITICAL_ONLY</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:ring-1 focus:ring-acid outline-none transition-all"
          >
            <option value="priority" className="bg-void">BY_PRIORITY</option>
            <option value="confidence" className="bg-void">BY_CONFIDENCE</option>
            <option value="evidence" className="bg-void">BY_EVIDENCE_COUNT</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedGaps.map(gap => (
          <Card key={gap.id} className="p-8 group hover:border-white/20 transition-all duration-500 bg-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold font-mono tracking-widest ${priorityColors[gap.priority]}`}>
                {priorityLabels[gap.priority]}
              </span>
              <span className="text-[10px] font-mono text-steel/40">{gap.createdAt}</span>
            </div>

            <h3 className="text-lg font-display font-bold text-white mb-4 leading-tight group-hover:text-acid transition-colors uppercase tracking-tight">
              {gap.area}
            </h3>

            <div className="space-y-3 mb-6 font-mono">
              <div className="flex justify-between items-center group/item">
                <span className="text-[10px] text-steel/30 uppercase tracking-widest group-hover/item:text-steel/50 transition-colors">CONFIDENCE_INDEX</span>
                <span className="text-sm text-white font-bold bg-white/5 px-2 py-0.5 rounded">
                  {(gap.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-[10px] text-steel/30 uppercase tracking-widest group-hover/item:text-steel/50 transition-colors">EVIDENCE_PROVENANCE</span>
                <span className="text-sm text-white font-bold bg-white/5 px-2 py-0.5 rounded">
                  {gap.supportingEvidence} SOURCES
                </span>
              </div>
            </div>

            <div className="bg-void/40 rounded-lg p-5 border border-white/5 group-hover:border-white/10 transition-colors">
              <h4 className="text-[10px] font-mono font-bold text-acid/60 mb-3 tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" /> PROTOCOL_RECO
              </h4>
              <p className="text-xs text-steel/80 leading-relaxed italic">
                {gap.recommendation}
              </p>
            </div>

            <div className="flex gap-2 mt-6 pt-6 border-t border-white/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedGap(gap)
                  setShowDetailsModal(true)
                }}
                className="flex-1 font-mono text-[10px] tracking-widest"
              >
                <BookOpen className="w-3 h-3 mr-2" /> DETAIL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  try {
                    const blob = new Blob([JSON.stringify(gaps.filter(g => g.priority !== 'low'), null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `research-gaps-${new Date().toISOString().slice(0, 10)}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    addToast('Gaps successfully exported to secure storage', 'success')
                  } catch (error) {
                    console.error('Export error:', error)
                    addToast('Export sequence failed', 'error')
                  }
                }}
                className="flex-1 font-mono text-[10px] tracking-widest"
              >
                <Download className="w-3 h-3 mr-2" /> EXPORT
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-acid/5 border-l-2 border-acid p-8 rounded-r-xl backdrop-blur-sm">
        <h3 className="font-display font-bold text-white mb-4 tracking-widest uppercase flex items-center gap-2">
          <Info className="w-5 h-5 text-acid" /> AUDIT_INSIGHTS
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-steel/80">
          <li className="flex items-start gap-2">
            <span className="text-acid">/</span> Use filters to isolate high-impact knowledge gaps.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-acid">/</span> Sorting prioritization based on statistical confidence.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-acid">/</span> Critical risks signify immediate experimental requirements.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-acid">/</span> Recommendations provide targeted biochemical protocols.
          </li>
        </ul>
      </div>

      {showDetailsModal && selectedGap && (
        <div className="fixed inset-0 bg-void/90 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-fade-in">
          <Card className="max-w-2xl w-full border-white/10 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-start p-8 border-b border-white/5 bg-white/5">
              <div>
                <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight mb-2">
                  {selectedGap.area}
                </h2>
                <p className="text-[10px] font-mono text-steel/40 tracking-widest uppercase">Entity Connectivity Audit</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-steel/40 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-steel/40 uppercase tracking-widest mb-1">PRIORITY_RANK</span>
                    <span className={`w-fit px-3 py-1 rounded border text-[10px] font-bold font-mono tracking-widest ${priorityColors[selectedGap.priority]}`}>
                      {priorityLabels[selectedGap.priority]}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-steel/40 uppercase tracking-widest mb-1">DATE_RECORDED</span>
                    <span className="text-sm text-white font-mono">{selectedGap.createdAt}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-steel/40 uppercase tracking-widest mb-1">CONFIDENCE_SCORE</span>
                    <span className="text-sm text-white font-mono font-bold">{(selectedGap.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-steel/40 uppercase tracking-widest mb-1">EVIDENCE_WEIGHT</span>
                    <span className="text-sm text-white font-mono font-bold">{selectedGap.supportingEvidence} SOURCES</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-mono font-bold text-acid mb-4 tracking-widest uppercase flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> RECOMMENDED_PROTOCOL
                </h4>
                <div className="bg-void/40 p-6 rounded-xl border border-white/5 italic text-sm text-steel leading-relaxed">
                  {selectedGap.recommendation}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-8 border-t border-white/5 bg-void/50 gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
                className="font-mono text-xs tracking-widest"
              >
                ABORT_INSPECTION
              </Button>
              <Button
                onClick={() => {
                  try {
                    const blob = new Blob([JSON.stringify(selectedGap, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `gap-${selectedGap.id}-${new Date().toISOString().slice(0, 10)}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    addToast('Individual gap profile exported', 'success')
                    setShowDetailsModal(false)
                  } catch (error) {
                    console.error('Export error:', error)
                    addToast('Export sequence failed', 'error')
                  }
                }}
                className="font-mono text-xs tracking-widest bg-acid text-void"
              >
                <Download className="w-3 h-3 mr-2" /> EXPORT_OBJECT
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
