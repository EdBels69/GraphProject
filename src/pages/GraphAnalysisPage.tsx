import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, Share2, Download, Filter, RefreshCw, FileText, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import GraphViewer from '@/components/GraphViewer'
import AnalyticsPanel from '@/components/AnalyticsPanel'
import { Graph, GraphNode, GraphEdge, createGraph } from '../../shared/types'
import { exportToWord, exportToPDF, downloadBlob } from '@/services/exportService'

// Demo graph data for testing
const DEMO_GRAPH: Graph = createGraph('Демонстрационный граф', false, [
  { id: 'p53', label: 'TP53 (p53)', weight: 10 },
  { id: 'mdm2', label: 'MDM2', weight: 8 },
  { id: 'bax', label: 'BAX', weight: 6 },
  { id: 'bcl2', label: 'BCL-2', weight: 5 },
  { id: 'casp3', label: 'Caspase-3', weight: 7 },
  { id: 'casp9', label: 'Caspase-9', weight: 5 },
  { id: 'cyto_c', label: 'Cytochrome C', weight: 6 },
  { id: 'apaf1', label: 'APAF-1', weight: 4 },
  { id: 'p21', label: 'p21 (CDKN1A)', weight: 6 },
  { id: 'cdk2', label: 'CDK2', weight: 5 },
  { id: 'cycline', label: 'Cyclin E', weight: 4 },
  { id: 'rb', label: 'RB1', weight: 5 },
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
  const [graph, setGraph] = useState<Graph | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null)
  const [loading, setLoading] = useState(false)

  // Load graph from navigation state or use demo
  useEffect(() => {
    const stateGraph = location.state?.graph
    if (stateGraph) {
      // Convert knowledge graph from upload to Graph type
      const nodes: GraphNode[] = stateGraph.graph?.nodes?.map((n: any) => ({
        id: n.id,
        label: n.data?.label || n.label || n.id,
        weight: n.data?.mentions || 1
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

    // Use demo graph if no data
    setGraph(DEMO_GRAPH)
  }, [location.state])

  const handleNodeSelect = (node: GraphNode) => {
    setSelectedNode(node)
    setSelectedEdge(null)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/upload">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              К загрузке
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{graph.name}</h1>
            <p className="text-sm text-gray-500">
              {graph.nodes.length} узлов • {graph.edges.length} связей
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadDemoGraph} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Демо-граф
          </Button>
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
            Word
          </Button>
          <Button variant="secondary" size="sm" onClick={async () => {
            if (!graph) return
            const blob = await exportToPDF(graph)
            downloadBlob(blob, `${graph.name}.pdf`)
          }}>
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph visualization */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <GraphViewer
              graph={graph}
              onNodeSelect={handleNodeSelect}
              onEdgeSelect={handleEdgeSelect}
              showControls={true}
            />
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Статистика</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Узлов:</span>
                <span className="font-medium">{graph.nodes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Связей:</span>
                <span className="font-medium">{graph.edges.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Плотность:</span>
                <span className="font-medium">
                  {(2 * graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ср. степень:</span>
                <span className="font-medium">
                  {(2 * graph.edges.length / graph.nodes.length).toFixed(2)}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Selected element info */}
          {(selectedNode || selectedEdge) && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">
                    {selectedNode ? 'Выбранный узел' : 'Выбранная связь'}
                  </h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                {selectedNode && (
                  <>
                    <p className="font-medium text-gray-900">{selectedNode.label}</p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-mono">{selectedNode.id}</span>
                      </div>
                      {selectedNode.weight !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Вес:</span>
                          <span>{selectedNode.weight}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {selectedEdge && (
                  <>
                    <p className="font-medium text-gray-900">
                      {selectedEdge.source} → {selectedEdge.target}
                    </p>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-mono">{selectedEdge.id}</span>
                      </div>
                      {selectedEdge.weight !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Вес:</span>
                          <span>{selectedEdge.weight}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {/* Top nodes */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Топ узлы</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {graph.nodes
                  .slice()
                  .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                  .slice(0, 5)
                  .map((node, i) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNodeSelect(node)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {i + 1}
                        </span>
                        <span className="truncate max-w-[120px]">{node.label}</span>
                      </div>
                      <span className="text-gray-500">{node.weight || 0}</span>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>

          {/* Advanced Analytics */}
          <AnalyticsPanel graph={graph} />
        </div>
      </div>
    </div>
  )
}
