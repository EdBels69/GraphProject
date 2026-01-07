import { useState, useRef, useEffect, useCallback } from 'react'
import { Graph, GraphNode, GraphEdge } from '@/shared/types'

interface GraphViewerProps {
  graph: Graph
  onNodeSelect?: (node: GraphNode) => void
  onEdgeSelect?: (edge: GraphEdge) => void
  onNodeDrag?: (nodeId: string, x: number, y: number) => void
  onNodeDrop?: (nodeId: string, x: number, y: number) => void
  showControls?: boolean
}

export default function GraphViewer({
  graph,
  onNodeSelect,
  onEdgeSelect,
  onNodeDrag,
  onNodeDrop,
  showControls = true
}: GraphViewerProps) {
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showLabels, setShowLabels] = useState(true)
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(() => {
    const positions = new Map<string, { x: number; y: number }>()
    const centerX = 600
    const centerY = 400
    const radius = 300

    graph.nodes.forEach((node, index) => {
      const angle = (index / graph.nodes.length) * 2 * Math.PI
      positions.set(node.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      })
    })

    return positions
  })

  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)

  const getNodePosition = useCallback((nodeId: string) => {
    return nodePositions.get(nodeId) || { x: 0, y: 0 }
  }, [nodePositions])

  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault()
    const pos = getNodePosition(nodeId)
    setDraggingNode(nodeId)
    setDragStart(pos)
    isDragging.current = true
  }, [getNodePosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !draggingNode) return

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setNodePositions(prev => {
      const newPositions = new Map(prev)
      const currentPos = newPositions.get(draggingNode)
      if (currentPos) {
        newPositions.set(draggingNode, {
          x: (x - offset.x) / scale,
          y: (y - offset.y) / scale
        })
      }
      return newPositions
    })
  }, [draggingNode, offset, scale, getNodePosition])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging.current && draggingNode) {
      const pos = getNodePosition(draggingNode)
      onNodeDrop?.(draggingNode, pos.x, pos.y)
    }
    isDragging.current = false
    setDraggingNode(null)
  }, [draggingNode, getNodePosition, onNodeDrop])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => {
      const newScale = prev * delta
      return Math.max(0.1, Math.min(3, newScale))
    })
  }, [])

  const handleNodeClick = useCallback((node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedNode(node)
    setSelectedEdge(null)
    onNodeSelect?.(node)
  }, [onNodeSelect])

  const handleEdgeClick = useCallback((edge: GraphEdge, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedEdge(edge)
    setSelectedNode(null)
    onEdgeSelect?.(edge)
  }, [onEdgeSelect])

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      setDragStart({
        x: e.clientX - rect.left - offset.x,
        y: e.clientY - rect.top - offset.y
      })
    }
  }, [offset])

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (draggingNode) return

    const svg = svgRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    setOffset({
      x: e.clientX - rect.left - dragStart.x,
      y: e.clientY - rect.top - dragStart.y
    })
  }, [dragStart, draggingNode])

  const handlePanEnd = useCallback(() => {
    setDragStart({ x: 0, y: 0 })
  }, [])

  const getArrowMarker = (color: string) => {
    return (
      <marker
        id={`arrow-${color}`}
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path
          d="M 0 0 L 10 5 L 0 10 z"
          fill={color}
        />
      </marker>
    )
  }

  const getNodeColor = (node: GraphNode, isSelected: boolean) => {
    if (isSelected) return '#4f46e5'
    return node.weight ? 
      `hsl(${(node.weight / 10) * 240}, 70%, 50%)` : 
      '#8b5cf6'
  }

  const getEdgeColor = (edge: GraphEdge, isSelected: boolean) => {
    if (isSelected) return '#4f46e5'
    return edge.weight ?
      `hsl(${(edge.weight / 10) * 240}, 70%, 60%)` :
      '#9ca3af'
  }

  const getNodeSize = (node: GraphNode) => {
    const baseSize = 30
    const weightMultiplier = node.weight ? Math.min(2, 1 + node.weight / 5) : 1
    return baseSize * weightMultiplier * scale
  }

  const getEdgeWidth = (edge: GraphEdge) => {
    const baseWidth = 2
    const weightMultiplier = edge.weight ? Math.min(3, 1 + edge.weight / 5) : 1
    return baseWidth * weightMultiplier * scale
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp(window.event as any)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [handleMouseUp])

  return (
    <div className="relative w-full h-[600px] bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden">
      {showControls && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 space-y-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Масштаб</label>
              <span className="text-sm text-gray-900">{(scale * 100).toFixed(0)}%</span>
            </div>
            <button
              onClick={() => setScale(1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Сбросить
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-4 py-2 rounded-md transition-colors ${
                showLabels ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {showLabels ? 'Скрыть метки' : 'Показать метки'}
            </button>
          </div>
          <div className="text-xs text-gray-600">
            Колесо: прокрутка
            <br />
            Shift + колесо: быстрый зум
            <br />
            Перетаскивание узлов
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-grab"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        onMouseMoveCapture={handlePanMove}
        onMouseUpCapture={handlePanEnd}
        style={{ cursor: draggingNode ? 'grabbing' : 'grab' }}
      >
        <defs>
          {getArrowMarker('#9ca3af')}
          {getArrowMarker('#4f46e5')}
        </defs>

        <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
          {graph.edges.map(edge => {
            const sourcePos = getNodePosition(edge.source)
            const targetPos = getNodePosition(edge.target)
            const isSelected = selectedEdge?.id === edge.id
            const color = getEdgeColor(edge, isSelected)
            const width = getEdgeWidth(edge)

            if (!sourcePos || !targetPos) return null

            return (
              <g key={edge.id}>
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={color}
                  strokeWidth={width}
                  fill="none"
                  markerEnd={graph.directed ? `url(#arrow-${color})` : undefined}
                  className="cursor-pointer hover:stroke-blue-500 transition-colors"
                  onClick={(e) => handleEdgeClick(edge, e)}
                  style={{
                    opacity: isSelected ? 1 : 0.6
                  }}
                />
                {(edge.weight !== undefined || edge.weight > 0) && showLabels && (
                  <text
                    x={(sourcePos.x + targetPos.x) / 2}
                    y={(sourcePos.y + targetPos.y) / 2 - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                    className="pointer-events-none"
                  >
                    {edge.weight}
                  </text>
                )}
              </g>
            )
          })}

          {graph.nodes.map(node => {
            const pos = getNodePosition(node.id)
            const isSelected = selectedNode?.id === node.id
            const isDragging = draggingNode === node.id
            const color = getNodeColor(node, isSelected)
            const size = getNodeSize(node)

            if (!pos) return null

            return (
              <g key={node.id}>
                {isDragging && (
                  <circle
                    cx={dragStart.x}
                    cy={dragStart.y}
                    r={size / 2}
                    fill={color}
                    opacity="0.3"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                    stroke={color}
                  />
                )}

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size}
                  fill={color}
                  stroke={isSelected ? '#4f46e5' : '#1e40af'}
                  strokeWidth={isSelected ? 3 : 2}
                  className="cursor-grab hover:stroke-blue-500 transition-colors"
                  onClick={(e) => handleNodeClick(node, e)}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  style={{
                    cursor: draggingNode === node.id ? 'grabbing' : 'grab'
                  }}
                />

                {showLabels && (
                  <text
                    x={pos.x}
                    y={pos.y - size - 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#374151"
                    fontWeight="500"
                    className="pointer-events-none select-none"
                  >
                    {node.label}
                  </text>
                )}

                {node.weight !== undefined && node.weight > 0 && showLabels && (
                  <text
                    x={pos.x}
                    y={pos.y + size + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                    className="pointer-events-none select-none"
                  >
                    Вес: {node.weight}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-20">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {selectedNode.label}
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="text-gray-900 font-mono">{selectedNode.id}</span>
            </div>
            {selectedNode.weight !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Вес:</span>
                <span className="text-gray-900 font-mono">{selectedNode.weight}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedEdge && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-20">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Связь
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="text-gray-900 font-mono">{selectedEdge.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">От:</span>
              <span className="text-gray-900 font-mono">{selectedEdge.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">К:</span>
              <span className="text-gray-900 font-mono">{selectedEdge.target}</span>
            </div>
            {selectedEdge.weight !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Вес:</span>
                <span className="text-gray-900 font-mono">{selectedEdge.weight}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}