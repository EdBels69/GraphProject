import { useState } from 'react'
import { toast } from 'sonner'

interface Node {
  id: string;
  name: string;
  type: string;
  degree: number;
  betweenness: number;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
}

export default function GraphVisualizationPage() {
  const [selectedLayout, setSelectedLayout] = useState<'force' | 'hierarchical' | 'circular'>('force')
  const [showLabels, setShowLabels] = useState(true)
  const [colorBy, setColorBy] = useState<'type' | 'community' | 'centrality'>('type')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const nodes: Node[] = [
    { id: 'p53', name: 'P53', type: 'protein', degree: 45, betweenness: 0.85 },
    { id: 'mdm2', name: 'MDM2', type: 'protein', degree: 38, betweenness: 0.72 },
    { id: 'atm', name: 'ATM', type: 'protein', degree: 52, betweenness: 0.91 },
    { id: 'brca1', name: 'BRCA1', type: 'gene', degree: 28, betweenness: 0.65 },
    { id: 'egfr', name: 'EGFR', type: 'protein', degree: 41, betweenness: 0.78 },
    { id: 'ras', name: 'Ras', type: 'protein', degree: 35, betweenness: 0.69 },
    { id: 'raf', name: 'Raf', type: 'protein', degree: 32, betweenness: 0.64 },
    { id: 'mek', name: 'MEK', type: 'protein', degree: 29, betweenness: 0.61 },
    { id: 'erk', name: 'ERK', type: 'protein', degree: 27, betweenness: 0.58 },
  ]

  const edges: Edge[] = [
    { id: 'e1', source: 'egfr', target: 'ras', type: 'binding', weight: 5 },
    { id: 'e2', source: 'ras', target: 'raf', type: 'activation', weight: 4 },
    { id: 'e3', source: 'raf', target: 'mek', type: 'phosphorylation', weight: 3 },
    { id: 'e4', source: 'mek', target: 'erk', type: 'phosphorylation', weight: 3 },
    { id: 'e5', source: 'p53', target: 'mdm2', type: 'inhibition', weight: 6 },
    { id: 'e6', source: 'mdm2', target: 'atm', type: 'binding', weight: 4 },
    { id: 'e7', source: 'atm', target: 'p53', type: 'phosphorylation', weight: 5 },
    { id: 'e8', source: 'brca1', target: 'p53', type: 'cooperation', weight: 3 },
  ]

  const nodeColors = {
    protein: '#3b82f6',
    gene: '#ef4444',
    metabolite: '#10b981',
  }

  const getNodeColor = (node: Node) => {
    if (colorBy === 'centrality') {
      return node.betweenness > 0.8 ? '#dc2626' : node.betweenness > 0.6 ? '#f59e0b' : '#3b82f6'
    }
    return nodeColors[node.type as keyof typeof nodeColors]
  }

  const getNodeSize = (node: Node) => {
    return 20 + node.degree * 0.5
  }

  const getNodePosition = (node: Node, layout: string) => {
    if (layout === 'circular') {
      const angle = (nodes.indexOf(node) / nodes.length) * 2 * Math.PI
      return {
        x: Math.cos(angle) * 300,
        y: Math.sin(angle) * 300,
      }
    }

    const positions: Record<string, { x: number; y: number }> = {
      'p53': { x: -100, y: 0 },
      'mdm2': { x: 100, y: 0 },
      'atm': { x: 100, y: 100 },
      'brca1': { x: 0, y: -50 },
      'egfr': { x: -150, y: 0 },
      'ras': { x: -150, y: 0 },
      'raf': { x: 150, y: 0 },
      'mek': { x: 150, y: 150 },
      'erk': { x: 250, y: 150 },
    }

    return positions[node.id] || { x: 0, y: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Графовый анализ биохимических взаимодействий
        </h1>

        <div className="flex space-x-4">
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value as typeof selectedLayout)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="force">Force-directed</option>
            <option value="hierarchical">Иерархический</option>
            <option value="circular">Круговой</option>
          </select>

          <select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value as typeof colorBy)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="type">По типу</option>
            <option value="community">По сообществам</option>
            <option value="centrality">По центральности</option>
          </select>

          <button
            onClick={() => setShowLabels(!showLabels)}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            {showLabels ? 'Скрыть метки' : 'Показать метки'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <svg width="100%" height="600" viewBox="-400 -300 800 600">
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source)!
              const targetNode = nodes.find(n => n.id === edge.target)!

              const sourcePos = getNodePosition(sourceNode, selectedLayout)
              const targetPos = getNodePosition(targetNode, selectedLayout)

              return (
                <line
                  key={edge.id}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={edge.type === 'inhibition' ? '#ef4444' : '#3b82f6'}
                  strokeWidth={edge.weight}
                  opacity={0.6}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}

            {nodes.map(node => {
              const pos = getNodePosition(node, selectedLayout)
              const size = getNodeSize(node)
              const color = getNodeColor(node)

              return (
                <g key={node.id} onClick={() => setSelectedNode(node)}>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size}
                    fill={color}
                    stroke="#1f2937"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    opacity={selectedNode?.id === node.id ? 1 : 0.8}
                  />
                  {showLabels && (
                    <text
                      x={pos.x}
                      y={pos.y + size + 5}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#374151"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          <div className="mt-4 flex justify-center space-x-4">
            <button 
              onClick={() => {
                setZoom(prev => Math.min(prev + 0.2, 3))
                toast.success('Масштаб увеличен')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              🔍 Zoom In
            </button>
            <button 
              onClick={() => {
                setZoom(prev => Math.max(prev - 0.2, 0.3))
                toast.success('Масштаб уменьшен')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              🔍 Zoom Out
            </button>
            <button 
              onClick={() => {
                setZoom(1)
                setPan({ x: 0, y: 0 })
                toast.success('Вид сброшен')
              }}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              🔄 Reset View
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Выбранный узел
            </h3>
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Название:</span>
                  <span className="font-semibold text-gray-900">{selectedNode.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Тип:</span>
                  <span className="font-semibold text-gray-900">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Степень:</span>
                  <span className="font-semibold text-gray-900">{selectedNode.degree}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Betweenness:</span>
                  <span className="font-semibold text-gray-900">{selectedNode.betweenness.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Связи:</span>
                  <span className="font-semibold text-gray-900">
                    {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Выберите узел на графе</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Легенда
            </h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: nodeColors.protein }}></div>
                <span className="text-sm text-gray-700">Белок</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: nodeColors.gene }}></div>
                <span className="text-sm text-gray-700">Ген</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: nodeColors.metabolite }}></div>
                <span className="text-sm text-gray-700">Метаболит</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-0.5 mr-2 bg-gray-400"></div>
                <span className="text-sm text-gray-700">Связь</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-0.5 mr-2" style={{ backgroundColor: '#ef4444' }}></div>
                <span className="text-sm text-gray-700">Ингибирование</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-0.5 mr-2 bg-primary-600"></div>
                <span className="text-sm text-gray-700">Активация</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Статистика графа
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Всего узлов:</span>
                <span className="font-semibold text-gray-900">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Всего связей:</span>
                <span className="font-semibold text-gray-900">{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Средняя степень:</span>
                <span className="font-semibold text-gray-900">
                  {(nodes.reduce((sum, n) => sum + n.degree, 0) / nodes.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Средний betweenness:</span>
                <span className="font-semibold text-gray-900">
                  {(nodes.reduce((sum, n) => sum + n.betweenness, 0) / nodes.length).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
