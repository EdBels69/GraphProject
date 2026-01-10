import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileDown, Activity, Users, Tag, BarChart2, BookOpen, Clock, Globe, Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

interface ArticleDetails {
  id: string
  title: string
  year: number
  category: string
  author: string
  abstract: string
  keywords: string[]
  citations: number
}

interface GraphStats {
  totalNodes: number
  totalEdges: number
  density: number
  averageDegree: number
}

export default function ReportPage() {
  const { id = 'a1' } = useParams<{ id: string }>()
  const { data: article, loading, error } = useApi<ArticleDetails>(`/articles/${id}`)

  // Mock graph stats for the report
  const graphStats: GraphStats = {
    totalNodes: 12,
    totalEdges: 13,
    density: 19.7,
    averageDegree: 2.17
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <Loader2 className="w-12 h-12 text-acid animate-spin" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardBody className="text-red-400">
            <h2 className="text-xl font-display font-bold tracking-widest uppercase mb-2">REPORT_RETRIEVAL_FAILED</h2>
            <p className="mb-6 font-mono text-sm">{error || 'Record entry not found in system.'}</p>
            <Link to="/works">
              <Button variant="secondary">RETURN TO REPOSITORY</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link to="/works">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-widest uppercase mb-0">
              ANALYSIS_REPORT: {article.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-steel/40 uppercase tracking-tighter">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {article.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {article.year} RELEASE
              </span>
            </div>
          </div>
        </div>
        <Button variant="primary" size="lg" className="shrink-0 shadow-glow-acid/20">
          <FileDown className="w-5 h-5 mr-3" />
          GENERATE PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section */}
          <Card>
            <CardHeader className="bg-white/5 border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-acid" />
                <h3 className="font-display font-bold text-white text-sm tracking-widest mb-0">AI_SUMMARY_X10</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <p className="text-steel/80 leading-relaxed italic text-sm">
                {article.abstract || 'Annotation missing. Neural model analyzing primary source for comprehensive synthesis...'}
              </p>
              <div className="p-5 bg-acid/5 rounded-2xl border border-acid/10 space-y-3">
                <h4 className="font-display font-bold text-acid text-xs tracking-widest flex items-center gap-2 uppercase">
                  <BarChart2 className="w-4 h-4" /> Core Synthesis
                </h4>
                <ul className="list-none space-y-2 text-steel/60 text-xs font-mono uppercase tracking-tight">
                  <li className="flex gap-2"><span className="text-acid">/</span> High node density in {article.category} signaling pathway</li>
                  <li className="flex gap-2"><span className="text-acid">/</span> Strong correlation detected between primary markers</li>
                  <li className="flex gap-2"><span className="text-acid">/</span> Recommended deep-dive into P53 sub-clusters</li>
                </ul>
              </div>
            </CardBody>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader className="bg-white/5 border-white/5">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-plasma-light" />
                <h3 className="font-display font-bold text-white text-sm tracking-widest mb-0">SEMANTIC_TAGS</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {article.keywords?.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-plasma/10 text-plasma-light border border-plasma/20 rounded-lg text-[10px] font-mono uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
                <span className="px-3 py-1.5 bg-white/5 text-steel/50 border border-white/10 rounded-lg text-[10px] font-mono uppercase tracking-widest">
                  {article.category}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-plasma/80 to-plasma border-none text-white shadow-glow-plasma/20">
            <CardHeader className="border-white/10 bg-white/5">
              <h3 className="font-display font-bold text-xs tracking-widest uppercase mb-0">NETWORK_METRICS</h3>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-6 p-8">
              <div className="text-center">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest font-display mb-1">NODES</p>
                <p className="text-3xl font-display font-bold tracking-widest">{graphStats.totalNodes}</p>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest font-display mb-1">EDGES</p>
                <p className="text-3xl font-display font-bold tracking-widest">{graphStats.totalEdges}</p>
              </div>
              <div className="text-center col-span-2 pt-6 border-t border-white/10">
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest font-display mb-1">DENSITY_RATIO</p>
                <p className="text-3xl font-display font-bold tracking-widest text-acid">{graphStats.density}%</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="bg-white/5 border-white/5">
              <h3 className="font-display font-bold text-xs tracking-widest uppercase mb-0">SYSTEM_METADATA</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <BookOpen className="w-5 h-5 text-steel/40" />
                </div>
                <div>
                  <p className="text-[10px] text-steel/30 uppercase font-bold tracking-widest font-display">CITATIONS</p>
                  <p className="text-sm font-mono text-white">{article.citations} REFERENCES</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <Globe className="w-5 h-5 text-steel/40" />
                </div>
                <div>
                  <p className="text-[10px] text-steel/30 uppercase font-bold tracking-widest font-display">TAXONOMY</p>
                  <p className="text-sm font-mono text-white">{article.category}</p>
                </div>
              </div>
              <Link to="/analysis" className="block pt-4">
                <Button variant="secondary" className="w-full h-12">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  INITIATE_ANALYSIS
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
