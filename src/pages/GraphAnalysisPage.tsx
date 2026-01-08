import { useState, useEffect } from 'react'
import { useLocation, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, BarChart3, Share2, Download, RefreshCw, FileText, FileDown, MessageCircle, Database, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import GraphViewer from '@/components/GraphViewer'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import GraphAssistant from '@/components/GraphAssistant'
import GraphDataTable from '@/components/GraphDataTable'
import { Graph, GraphNode, GraphEdge, createGraph } from '../../shared/types'
import { exportToWord, exportToPDF, downloadBlob } from '@/services/exportService'

// Demo graph data for testing
const DEMO_GRAPH: Graph = createGraph('Демонстрационный граф', false, [
  { id: 'p53', label: 'TP53 (p53)', weight: 10, type: 'protein' },
  { id: 'mdm2', label: 'MDM2', weight: 8, type: 'protein' },
  { id: 'bax', label: 'BAX', weight: 6, type: 'protein' },
  { id: 'bcl2', label: 'BCL-2', weight: 5, type: 'protein' },
  { id: 'casp3', label: 'Caspase-3', weight: 7, type: 'protein' },
  { id: 'casp9', label: 'Caspase-9', weight: 5, type: 'protein' },
  { id: 'cyto_c', label: 'Cytochrome C', weight: 6, type: 'protein' },
  { id: 'apaf1', label: 'APAF-1', weight: 4, type: 'protein' },
  { id: 'p21', label: 'p21 (CDKN1A)', weight: 6, type: 'protein' },
  { id: 'cdk2', label: 'CDK2', weight: 5, type: 'protein' },
  { id: 'cycline', label: 'Cyclin E', weight: 4, type: 'protein' },
  { id: 'rb', label: 'RB1', weight: 5, type: 'protein' },
], [
  { id: 'e1', source: 'p53', target: 'mdm2', weight: 9 },
  { id: 'e2', source: 'mdm2', target: 'p53', weight: 8 },
  { id: 'e3', source: 'p53', target: 'bax', weight: 7 },
  { id: 'e4', source: 'bax', target: 'bcl2', weight: 5 },
  { id: 'e5', source: 'bax', target: 'cyto_c', weight: 6 },
  { id: 'e6', source: 'cyto_c', target: 'apaf1', weight: 5 },
  { id: 'e7', source: 'apaf1', target: 'casp9', weight: 6 },
  { id: 'e8', source: 'casp9', target: 'casp3', weight: 7 },
  { id: 'e9', source: 'p53', target: 'p21', weight: 8 },
  { id: 'e10', source: 'p21', target: 'cdk2', weight: 6 },
  { id: 'e11', source: 'cdk2', target: 'cycline', weight: 5 },
  { id: 'e12', source: 'cdk2', target: 'rb', weight: 5 },
  { id: 'e13', source: 'bcl2', target: 'casp3', weight: 4 },
])

export default function GraphAnalysisPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [graph, setGraph] = useState<Graph | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null)
  const [loading, setLoading] = useState(false)

  // Right panel state
  const [activeTab, setActiveTab] = useState<'chat' | 'stats' | 'data'>('stats')
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
          setGraph(createGraph('Загруженный граф', false, nodes, edges))
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
              <div className="flex-1 overflow-hidden bg-gray-50/50">
                {activeTab === 'chat' && (
                  <GraphAssistant
                    selectedNode={selectedNode}
                    graphId={graph.id}
                    graph={graph}
                    onClose={() => setIsPanelOpen(false)}
                  />
                )}

                {activeTab === 'stats' && (
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
                )}

                {activeTab === 'data' && (
                  <div className="h-full flex flex-col">
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
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
