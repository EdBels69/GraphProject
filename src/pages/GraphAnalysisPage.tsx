import { useState, useEffect } from 'react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, Share2, Download, RefreshCw, FileText, FileDown, MessageCircle, Database, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import GraphViewer from '@/components/GraphViewer'
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
const DEMO_GRAPH: Graph = createGraph('Демонстрационный граф', false)
DEMO_GRAPH.nodes = [
  { id: 'p53', label: 'TP53 (p53)', weight: 10, type: 'protein', data: { id: 'p53', name: 'TP53', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'mdm2', label: 'MDM2', weight: 8, type: 'protein', data: { id: 'mdm2', name: 'MDM2', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'bax', label: 'BAX', weight: 6, type: 'protein', data: { id: 'bax', name: 'BAX', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'bcl2', label: 'BCL-2', weight: 5, type: 'protein', data: { id: 'bcl2', name: 'BCL-2', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'casp3', label: 'Caspase-3', weight: 7, type: 'protein', data: { id: 'casp3', name: 'Caspase-3', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'casp9', label: 'Caspase-9', weight: 5, type: 'protein', data: { id: 'casp9', name: 'Caspase-9', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'cyto_c', label: 'Cytochrome C', weight: 6, type: 'protein', data: { id: 'cyto_c', name: 'Cyto C', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'apaf1', label: 'APAF-1', weight: 4, type: 'protein', data: { id: 'apaf1', name: 'APAF-1', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'p21', label: 'p21 (CDKN1A)', weight: 6, type: 'protein', data: { id: 'p21', name: 'p21', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'cdk2', label: 'CDK2', weight: 5, type: 'protein', data: { id: 'cdk2', name: 'CDK2', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
  { id: 'cycline', label: 'Cyclin E', weight: 4, type: 'protein', data: { id: 'cycline', name: 'Cyclin E', type: 'protein', confidence: 1, evidence: [], mentions: 0, source: 'manual', position: 0 } },
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
          const newGraph = createGraph('Загруженный граф', false)
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
    // Auto-open chat if closed, or switch to stats/chat if appropriate
    if (!isPanelOpen) setIsPanelOpen(true)
    // Optional: Switch to chat to ask about the node? 
    // Users preferred keeping context, so we won't force switch tab, but ensure sidebar is open.
    // If user wants AI insights, they click Chat.
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка графа...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/upload">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              К загрузке
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{graph.name}</h1>
            <p className="text-xs text-gray-500">
              {graph.nodes.length} узлов • {graph.edges.length} связей • Плотность: {(2 * graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Controls */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-4">
            <button
              onClick={() => { setActiveTab('chat'); setIsPanelOpen(true) }}
              className={`px-3 py-1.4 text-sm font-medium rounded-md transition-all ${activeTab === 'chat' && isPanelOpen ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>AI Аналитик</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('research'); setIsPanelOpen(true) }}
              className={`px-3 py-1.4 text-sm font-medium rounded-md transition-all ${activeTab === 'research' && isPanelOpen ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Research</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('stats'); setIsPanelOpen(true) }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'stats' && isPanelOpen ? 'bg-white shadow text-purple-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Инфо</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('data'); setIsPanelOpen(true) }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'data' && isPanelOpen ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Таблица</span>
              </div>
            </button>
            <button
              onClick={() => { setActiveTab('list'); setIsPanelOpen(true) }}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'list' && isPanelOpen ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Сохраненные</span>
              </div>
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={loadDemoGraph} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Демо
          </Button>

          <Link to={graph.id ? `/analysis/data/${graph.id}` : '#'} state={{ graph }}>
            <Button variant="outline" size="sm" className="mr-2">
              <Database className="w-4 h-4 mr-2" />
              Все данные
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleExportJSON}>
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={async () => {
            if (!graph) return
            const blob = await exportToWord(graph)
            downloadBlob(blob, `${graph.name}.docx`)
          }}>
            <FileText className="w-4 h-4 mr-2" />
            Docx
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Left: Graph Visualization (Flexible Width) */}
        <div className={`transition-all duration-300 ${isPanelOpen ? 'w-2/3 pr-2' : 'w-full'} h-full flex flex-col`}>
          <Card className="flex-1 h-full shadow-md border overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-white/80 p-2 rounded-lg backdrop-blur text-xs">
              {selectedNode ? (
                <div>
                  <span className="font-bold">{selectedNode.label}</span>
                  <div className="text-gray-500">ID: {selectedNode.id}</div>
                </div>
              ) : (
                <span className="text-gray-500">Выберите узел для деталей</span>
              )}
            </div>
            <GraphViewer
              graph={graph}
              onNodeSelect={handleNodeSelect}
              onEdgeSelect={handleEdgeSelect}
              showControls={true}
            />
          </Card>
        </div>

        {/* Right: Tabbed Panel (Fixed Width when open) */}
        <div className={`transition-all duration-300 ${isPanelOpen ? 'w-1/3 translate-x-0' : 'w-0 translate-x-full absolute right-0'} h-full border-l bg-white flex flex-col shadow-xl z-20`}>
          {isPanelOpen && (
            <>
              {/* Tab Content */}
              <div className="flex-1 overflow-hidden bg-gray-50/50 relative h-full">
                {/* Chat Tab - Always mounted to preserve history */}
                <div style={{ display: activeTab === 'chat' ? 'flex' : 'none' }} className="h-full flex-col">
                  <GraphAssistant
                    selectedNode={selectedNode}
                    graphId={graph.id}
                    graph={graph}
                    onClose={() => setIsPanelOpen(false)}
                  />
                </div>

                {/* Stats Tab */}
                <div style={{ display: activeTab === 'stats' ? 'block' : 'none' }} className="h-full">
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="font-bold text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Метрики Графа
                      </h2>
                      <Button size="sm" variant="ghost" onClick={() => setIsPanelOpen(false)}>×</Button>
                    </div>
                    <AnalyticsPanel graph={graph} />
                  </div>
                </div>

                {/* Data Tab */}
                <div style={{ display: activeTab === 'data' ? 'flex' : 'none' }} className="h-full flex-col">
                  <div className="flex justify-between items-center p-4 border-b bg-white">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-600" />
                      Данные Графа
                    </h2>
                    <Button size="sm" variant="ghost" onClick={() => setIsPanelOpen(false)}>×</Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <GraphDataTable graph={graph} onNodeSelect={handleNodeSelect} />
                  </div>
                </div>

                {/* Saved Graphs Tab */}
                <div style={{ display: activeTab === 'list' ? 'flex' : 'none' }} className="h-full flex-col">
                  <div className="flex justify-between items-center p-4 border-b bg-white">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <Database className="w-5 h-5 text-orange-600" />
                      Сохраненные Графы
                    </h2>
                    <Button size="sm" variant="ghost" onClick={() => setIsPanelOpen(false)}>×</Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <SavedGraphsList
                      currentGraphId={graph?.id}
                      onLoadGraph={(id) => {
                        setLoading(true)
                        setSearchParams({ graphId: id })
                        setSearchParams({ graphId: id })
                        setActiveTab('stats')
                      }}
                    />
                  </div>
                </div>

                {/* Research Tab */}
                <div style={{ display: activeTab === 'research' ? 'flex' : 'none' }} className="h-full flex-col">
                  {graph && (
                    <ResearchPanel
                      graphId={graph.id}
                      onGraphUpdate={() => {
                        // Reload graph data
                        fetch(`/api/graphs/${graph.id}`)
                          .then(r => r.json())
                          .then(d => {
                            if (d.success) setGraph(d.data)
                          })
                      }}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
