import { useState, useRef, useEffect, useCallback } from 'react'
import { Graph, GraphNode, GraphEdge } from '../../shared/contracts/graph'
import { ZoomIn, ZoomOut, Maximize, RefreshCw, Eye, EyeOff, Move } from 'lucide-react'

interface GraphViewerProps {
  graph: Graph
  onNodeSelect?: (node: GraphNode) => void
  onEdgeSelect?: (edge: GraphEdge) => void
  onNodeDrag?: (nodeId: string, x: number, y: number) => void
  onNodeDrop?: (nodeId: string, x: number, y: number) => void
  showControls?: boolean
  selectedNodeId?: string
}

export default function GraphViewer({
  graph,
  onNodeSelect,
  onEdgeSelect,
  onNodeDrag,
  onNodeDrop,
  showControls = true,
  selectedNodeId
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

  // Sync internal selection with prop
  useEffect(() => {
    if (selectedNodeId) {
      const node = graph.nodes.find(n => n.id === selectedNodeId)
      if (node) setSelectedNode(node)
    } else {
      setSelectedNode(null)
    }
  }, [selectedNodeId, graph.nodes])

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

  const [isPanning, setIsPanning] = useState(false)
  const lastPanPosition = useRef({ x: 0, y: 0 })

  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (draggingNode) return

    setIsPanning(true)
    lastPanPosition.current = { x: e.clientX, y: e.clientY }
  }, [draggingNode])

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return

    const dx = e.clientX - lastPanPosition.current.x
    const dy = e.clientY - lastPanPosition.current.y

    setOffset(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }))

    lastPanPosition.current = { x: e.clientX, y: e.clientY }
  }, [isPanning])

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleCenterView = useCallback(() => {
    setOffset({ x: 0, y: 0 })
    setScale(1)
  }, [])

  const handleFitView = useCallback(() => {
    if (graph.nodes.length === 0) return

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodePositions.forEach(pos => {
      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, pos.x)
      maxY = Math.max(maxY, pos.y)
    })

    const width = maxX - minX
    const height = maxY - minY
    const padding = 100

    const containerWidth = svgRef.current?.clientWidth || 800
    const containerHeight = svgRef.current?.clientHeight || 600

    const scaleX = (containerWidth - padding) / width
    const scaleY = (containerHeight - padding) / height
    const newScale = Math.min(Math.min(scaleX, scaleY), 1)

    const graphCenterX = (minX + maxX) / 2
    const graphCenterY = (minY + maxY) / 2

    const containerCenterX = containerWidth / 2
    const containerCenterY = containerHeight / 2

    const newOffsetX = containerCenterX - (graphCenterX * newScale)
    const newOffsetY = containerCenterY - (graphCenterY * newScale)

    setScale(newScale)
    setOffset({ x: newOffsetX, y: newOffsetY })
  }, [graph.nodes, nodePositions])

  const getArrowMarker = (color: string) => {
    return (
      <marker
        id={`arrow-${color.replace('#', '')}`}
        viewBox="0 0 10 10"
        refX="20"
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

  const getTypeColor = (type?: string) => {
    const normalized = type?.toLowerCase() || 'concept'
    if (['gene', 'protein'].includes(normalized)) return '#CCFF00' // Acid
    if (['disease', 'disorder', 'symptom'].includes(normalized)) return '#F43F5E' // Rose
    if (['drug', 'chemical', 'medication'].includes(normalized)) return '#B829EA' // Plasma
    if (['pathway', 'process', 'mechanism'].includes(normalized)) return '#38BDF8' // Sky Blue
    if (['anatomy', 'tissue', 'organ', 'cell'].includes(normalized)) return '#F59E0B' // Amber
    if (['article', 'paper'].includes(normalized)) return '#94A3B8' // Steel
    return '#64748B' // Slate
  }

  const getNodeColor = (node: GraphNode, isSelected: boolean) => {
    if (isSelected) return '#FFFFFF' // Selected = White
    return getTypeColor(node.data?.type || node.type)
  }

  const getEdgeColor = (edge: GraphEdge, isSelected: boolean) => {
    if (isSelected) return '#FFFFFF'
    return '#334155' // Slate-700 for edges
  }

  const getNodeSize = (node: GraphNode) => {
    const baseSize = 30
    const weightMultiplier = node.weight ? Math.min(2, 1 + node.weight / 5) : 1
    return baseSize * weightMultiplier
  }

  const getEdgeWidth = (edge: GraphEdge) => {
    const baseWidth = 1
    const weightMultiplier = edge.weight ? Math.min(3, 1 + edge.weight / 5) : 1
    return baseWidth * weightMultiplier
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp(window.event as any)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [handleMouseUp])

  return (
    <div className="relative w-full h-full bg-void overflow-hidden">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: `translate(${offset.x % 40}px, ${offset.y % 40}px)`
        }}
      />

      {showControls && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="glass-panel p-2 rounded-lg flex flex-col gap-1 backdrop-blur-md border border-white/10">
            <button
              onClick={() => setScale(s => Math.min(3, s * 1.2))}
              className="p-2 hover:bg-white/10 rounded transition-colors text-steel hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setScale(s => Math.max(0.1, s * 0.8))}
              className="p-2 hover:bg-white/10 rounded transition-colors text-steel hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleCenterView}
              className="p-2 hover:bg-white/10 rounded transition-colors text-steel hover:text-white"
              title="Reset View"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleFitView}
              className="p-2 hover:bg-white/10 rounded transition-colors text-steel hover:text-white"
              title="Fit to Screen"
            >
              <Maximize className="w-5 h-5" />
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded transition-colors ${showLabels ? 'text-acid bg-acid/10' : 'text-steel hover:bg-white/10'}`}
              title="Toggle Labels"
            >
              {showLabels ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="glass-panel px-3 py-1 rounded text-xs font-mono text-steel border border-white/10 backdrop-blur-md">
            {(scale * 100).toFixed(0)}%
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-default"
        onMouseMove={(e) => {
          handleMouseMove(e)
          handlePanMove(e)
        }}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        onMouseLeave={handlePanEnd}
        onMouseUpCapture={handlePanEnd}
        style={{ cursor: isPanning ? 'grabbing' : draggingNode ? 'grabbing' : 'default' }}
      >
        <defs>
          {getArrowMarker('#334155')}
          {getArrowMarker('#FFFFFF')}
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
                  markerEnd={graph.directed ? `url(#arrow-${color.replace('#', '')})` : undefined}
                  className="cursor-pointer transition-all duration-300"
                  onClick={(e) => handleEdgeClick(edge, e)}
                  style={{
                    opacity: isSelected ? 1 : 0.4
                  }}
                />
                {edge.weight !== undefined && edge.weight > 0 && showLabels && (
                  <text
                    x={(sourcePos.x + targetPos.x) / 2}
                    y={(sourcePos.y + targetPos.y) / 2 - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748B"
                    className="pointer-events-none font-mono"
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

                {/* Glow effect for selected nodes */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size + 5}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeOpacity="0.5"
                  >
                    <animate attributeName="r" values={`${size + 5};${size + 10};${size + 5}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.5;0.0;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size}
                  fill={isSelected ? '#000000' : '#1e1e1e'} // Dark fill for nodes
                  stroke={color}
                  strokeWidth={isSelected ? 4 : 2}
                  className="cursor-grab transition-all duration-200"
                  onClick={(e) => handleNodeClick(node, e)}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  style={{
                    cursor: draggingNode === node.id ? 'grabbing' : 'grab',
                    filter: isSelected ? `drop-shadow(0 0 8px ${color})` : 'none'
                  }}
                />

                {/* Inner dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={size / 3}
                  fill={color}
                  opacity={0.8}
                  className="pointer-events-none"
                />

                {showLabels && (
                  <text
                    x={pos.x}
                    y={pos.y + size + 15}
                    textAnchor="middle"
                    fill="white"
                    fontWeight="600"
                    fontSize="12"
                    className="pointer-events-none select-none font-display tracking-wide shadow-black drop-shadow-md"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {node.label}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Selection HUD at bottom left */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 glass-panel border border-white/10 p-4 rounded-xl max-w-sm z-20 backdrop-blur-md animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: getNodeColor(selectedNode, false), boxShadow: `0 0 10px ${getNodeColor(selectedNode, false)}` }} />
            <h3 className="text-lg font-bold text-white font-display">
              {selectedNode.label}
            </h3>
          </div>
          <div className="space-y-1 text-xs font-mono text-gray-400">
            <div className="flex justify-between gap-8 border-b border-white/5 pb-1">
              <span>ID</span>
              <span className="text-white">{selectedNode.id}</span>
            </div>
            <div className="flex justify-between gap-8 border-b border-white/5 pb-1">
              <span>TYPE</span>
              <span className="text-acid uppercase">{selectedNode.data?.type || 'ENTITY'}</span>
            </div>
            {selectedNode.weight !== undefined && (
              <div className="flex justify-between gap-8 pt-1">
                <span>WEIGHT</span>
                <span className="text-white">{selectedNode.weight}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}