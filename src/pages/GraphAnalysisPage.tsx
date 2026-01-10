import { useState, useEffect } from 'react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, Share2, Download, RefreshCw, FileText, FileDown, MessageCircle, Database, Info, Atom, Layers, Search, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
// import GraphViewer from '@/components/GraphViewer'
import GraphViewerWebGL from '@/components/GraphViewerWebGL' // High-performance WebGL viewer
import AnalyticsPanel from '@/components/AnalyticsPanel'
import GraphAssistant from '@/components/GraphAssistant'
import GraphDataTable from '@/components/GraphDataTable'
import SavedGraphsList from '@/components/SavedGraphsList'
import { ResearchPanel } from '@/components/ResearchPanel'
import {
  Graph,
  GraphNode,
  GraphEdge,
  createGraph,
  createNode,
  createEdge
} from '../../shared/contracts/graph'
import { exportToWord, exportToPDF, downloadBlob } from '@/services/exportService'

// Demo graph data for testing
const DEMO_GRAPH: Graph = createGraph('DEMO_SEQUENCE_ALPHA', false)
DEMO_GRAPH.nodes = [
  { id: 'p53', label: 'TP53', weight: 10, type: 'protein', data: { id: 'p53', name: 'TP53', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'mdm2', label: 'MDM2', weight: 8, type: 'protein', data: { id: 'mdm2', name: 'MDM2', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'bax', label: 'BAX', weight: 6, type: 'protein', data: { id: 'bax', name: 'BAX', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'bcl2', label: 'BCL-2', weight: 5, type: 'protein', data: { id: 'bcl2', name: 'BCL-2', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'casp3', label: 'CASP3', weight: 7, type: 'protein', data: { id: 'casp3', name: 'Caspase-3', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'casp9', label: 'CASP9', weight: 5, type: 'protein', data: { id: 'casp9', name: 'Caspase-9', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'cyto_c', label: 'CYCS', weight: 6, type: 'protein', data: { id: 'cyto_c', name: 'Cyto C', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'apaf1', label: 'APAF1', weight: 4, type: 'protein', data: { id: 'apaf1', name: 'APAF-1', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'p21', label: 'CDKN1A', weight: 6, type: 'protein', data: { id: 'p21', name: 'p21', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'cdk2', label: 'CDK2', weight: 5, type: 'protein', data: { id: 'cdk2', name: 'CDK2', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'cycline', label: 'CCNE1', weight: 4, type: 'protein', data: { id: 'cycline', name: 'Cyclin E', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'rb', label: 'RB1', weight: 5, type: 'protein', data: { id: 'rb', name: 'RB1', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
]
DEMO_GRAPH.edges = [
  { id: 'e1', source: 'p53', target: 'mdm2', weight: 9, data: { id: 'e1', source: 'p53', target: 'mdm2', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e2', source: 'mdm2', target: 'p53', weight: 8, data: { id: 'e2', source: 'mdm2', target: 'p53', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e3', source: 'p53', target: 'bax', weight: 7, data: { id: 'e3', source: 'p53', target: 'bax', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e4', source: 'bax', target: 'bcl2', weight: 5, data: { id: 'e4', source: 'bax', target: 'bcl2', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e5', source: 'bax', target: 'cyto_c', weight: 6, data: { id: 'e5', source: 'bax', target: 'cyto_c', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e6', source: 'cyto_c', target: 'apaf1', weight: 5, data: { id: 'e6', source: 'cyto_c', target: 'apaf1', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e7', source: 'apaf1', target: 'casp9', weight: 6, data: { id: 'e7', source: 'apaf1', target: 'casp9', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e8', source: 'casp9', target: 'casp3', weight: 7, data: { id: 'e8', source: 'casp9', target: 'casp3', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e9', source: 'p53', target: 'p21', weight: 8, data: { id: 'e9', source: 'p53', target: 'p21', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e10', source: 'p21', target: 'cdk2', weight: 6, data: { id: 'e10', source: 'p21', target: 'cdk2', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e11', source: 'cdk2', target: 'cycline', weight: 5, data: { id: 'e11', source: 'cdk2', target: 'cycline', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e12', source: 'cdk2', target: 'rb', weight: 5, data: { id: 'e12', source: 'cdk2', target: 'rb', type: 'interacts_with', confidence: 1, evidence: [] } },
  { id: 'e13', source: 'bcl2', target: 'casp3', weight: 4, data: { id: 'e13', source: 'bcl2', target: 'casp3', type: 'interacts_with', confidence: 1, evidence: [] } },
]


export default function GraphAnalysisPage() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [graph, setGraph] = useState<Graph | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null)
  const [loading, setLoading] = useState(false)

  // Right panel state
  const [activeTab, setActiveTab] = useState<'chat' | 'stats' | 'data' | 'list' | 'research'>('stats')
  const [isPanelOpen, setIsPanelOpen] = useState(true)

  // Load graph from navigation state, URL params, or use demo
  useEffect(() => {
    const loadGraph = async () => {
      // 1. Try location state (from upload)
      const stateGraph = location.state?.graph
      if (stateGraph) {
        // Convert knowledge graph from upload to Graph type
        const nodes: GraphNode[] = stateGraph.graph?.nodes?.map((n: any) => ({
          id: n.id,
          label: n.data?.label || n.label || n.id,
          weight: n.data?.mentions || 1,
          type: n.data?.type || 'entity'
        })) || []

        const edges: GraphEdge[] = stateGraph.graph?.edges?.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          weight: e.data?.confidence || 1
        })) || []

        if (nodes.length > 0) {
          const newGraph = createGraph('Uploaded Graph', false)
          newGraph.nodes = nodes
          newGraph.edges = edges
          setGraph(newGraph)
          return
        }
      }

      // 2. Try URL query param
      const graphId = searchParams.get('graphId')
      if (graphId) {
        setLoading(true)
        try {
          const response = await fetch(`/api/graphs/${graphId}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
              setGraph(result.data)
              setLoading(false)
              return
            }
          }
        } catch (error) {
          console.error('Failed to load graph:', error)
        }
        setLoading(false)
      }

      // 3. Fallback to demo
      if (!graph) {
        setGraph(DEMO_GRAPH)
      }
    }

    loadGraph()
  }, [location.state, searchParams])

  const handleNodeSelect = (node: GraphNode) => {
    setSelectedNode(node)
    setSelectedEdge(null)
    if (!isPanelOpen) setIsPanelOpen(true)
    setActiveTab('chat')
  }

  const handleEdgeSelect = (edge: GraphEdge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }

  const handleExportJSON = () => {
    if (!graph) return
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${graph.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadDemoGraph = () => {
    setLoading(true)
    setTimeout(() => {
      setGraph(DEMO_GRAPH)
      setLoading(false)
    }, 500)
  }

  if (!graph) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-void">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acid mx-auto" />
          <p className="text-steel font-mono tracking-widest text-xs">INITIALIZING_VISUALIZATION...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-void flex flex-col font-sans overflow-hidden">

      {/* Top Glass Bar */}
      <div className="h-16 flex items-center justify-between px-6 z-30 border-b border-white/5 bg-void/80 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link to="/upload" className="flex items-center gap-2 text-steel/60 hover:text-acid transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-mono text-xs tracking-widest">BACK</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-acid animate-pulse-slow shadow-glow-acid" />
            <div>
              <h1 className="text-lg font-bold font-display text-white tracking-wide uppercase">{graph.name}</h1>
              <div className="flex items-center gap-3 text-[10px] font-mono text-steel/60">
                <span>NODES: {graph.nodes.length}</span>
                <span>EDGES: {graph.edges.length}</span>
                <span>DENSITY: {(2 * graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toolbar Actions */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
            <button title="Demo Reload" onClick={loadDemoGraph} className="p-2 hover:bg-white/10 rounded text-steel hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button title="Export JSON" onClick={handleExportJSON} className="p-2 hover:bg-white/10 rounded text-steel hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button title="Export Docx" onClick={async () => {
              if (!graph) return
              const blob = await exportToWord(graph)
              downloadBlob(blob, `${graph.name}.docx`)
            }} className="p-2 hover:bg-white/10 rounded text-steel hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Tab Toggle (if panel closed) */}
          {!isPanelOpen && (
            <button
              onClick={() => setIsPanelOpen(true)}
              className="p-2 bg-acid/10 border border-acid/20 text-acid rounded hover:bg-acid/20 transition-colors"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* Graph Viewer (Background Layer) */}
        {/* Graph Viewer (Background Layer) */}
        <div className="absolute inset-0 z-0">
          <GraphViewerWebGL
            graph={graph}
            onNodeSelect={handleNodeSelect}
            onEdgeSelect={handleEdgeSelect}
          />
        </div>

        {/* Right Panel (Sliding Glass Sidebar) */}
        <div className={`
             absolute top-0 right-0 bottom-0 h-full z-20 transition-all duration-500 ease-in-out border-l border-white/10 bg-void/80 backdrop-blur-xl shadow-2xl flex flex-col
             ${isPanelOpen ? 'w-[450px] translate-x-0' : 'w-[450px] translate-x-full'}
        `}>
          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsPanelOpen(false)}
            className="absolute -left-10 top-4 p-2 bg-void/80 border border-white/10 border-r-0 rounded-l text-steel hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>

          {/* Tabs Header */}
          <div className="flex items-center gap-1 p-2 border-b border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'stats', icon: BarChart3, label: 'METRICS' },
              { id: 'chat', icon: MessageCircle, label: 'AI_ANALYST' },
              { id: 'research', icon: FlaskConical, label: 'RESEARCH' },
              { id: 'data', icon: Database, label: 'DATA' },
              { id: 'list', icon: Share2, label: 'SAVED' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                            flex items-center gap-2 px-3 py-2 rounded text-[10px] font-bold tracking-wider font-display transition-all whitespace-nowrap
                            ${activeTab === tab.id
                    ? 'bg-acid text-void shadow-glow-acid'
                    : 'text-steel hover:bg-white/5 hover:text-white'}
                        `}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content Area */}
          <div className="flex-1 overflow-hidden relative">

            {/* AI Chat */}
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <GraphAssistant
                selectedNode={selectedNode}
                graphId={graph.id}
                graph={graph}
                onClose={() => setIsPanelOpen(false)}
              />
            </div>

            {/* Metrics */}
            <div className={`absolute inset-0 overflow-y-auto p-6 transition-opacity duration-300 ${activeTab === 'stats' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-acid" /> NETWORK_METRICS
              </h2>
              <AnalyticsPanel graph={graph} />
            </div>

            {/* Research */}
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'research' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              {graph && (
                <ResearchPanel
                  graphId={graph.id}
                  onGraphUpdate={() => {
                    fetch(`/api/graphs/${graph.id}`)
                      .then(r => r.json())
                      .then(d => { if (d.success) setGraph(d.data) })
                  }}
                />
              )}
            </div>

            {/* Data Table */}
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'data' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className="p-4 border-b border-white/5">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-plasma" /> RAW_DATA
                </h2>
              </div>
              <div className="flex-1 overflow-auto bg-black/20">
                <GraphDataTable graph={graph} onNodeSelect={handleNodeSelect} />
              </div>
            </div>

            {/* Saved Graphs */}
            <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'list' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <div className="p-4 border-b border-white/5">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-400" /> GRAPH_LIBRARY
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SavedGraphsList
                  currentGraphId={graph?.id}
                  onLoadGraph={(id) => {
                    setLoading(true)
                    setSearchParams({ graphId: id })
                    setActiveTab('stats')
                  }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
