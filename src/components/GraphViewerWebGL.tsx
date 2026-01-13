import { useRef, useCallback, useMemo, useEffect, useState } from 'react'
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d'
import { Graph, GraphNode, GraphEdge } from '../../shared/contracts/graph'

interface GraphViewerWebGLProps {
    graph: Graph
    selectedNode?: GraphNode | null
    selectedEdge?: GraphEdge | null
    onNodeSelect?: (node: GraphNode) => void
    onEdgeSelect?: (edge: GraphEdge) => void
    width?: number
    height?: number
}

export default function GraphViewerWebGL({
    graph,
    selectedNode,
    selectedEdge,
    onNodeSelect,
    onEdgeSelect,
    width,
    height
}: GraphViewerWebGLProps) {
    const fgRef = useRef<ForceGraphMethods>()
    const [hoverNode, setHoverNode] = useState<any>(null)

    // Transform graph data to match ForceGraph expected format (it mutates objects, so we copy)
    const graphData = useMemo(() => {
        return {
            nodes: graph.nodes.map(n => ({ ...n, id: n.id, val: n.properties.weight || 1 })),
            links: graph.edges.map(e => ({ ...e, source: e.source, target: e.target }))
        }
    }, [graph])

    // Find neighbors for highlighting
    const neighbors = useMemo(() => {
        if (!selectedNode && !hoverNode) return new Set()
        const targetId = selectedNode?.id || hoverNode?.id
        const nodeNeighbors = new Set()
        graph.edges.forEach(edge => {
            if (edge.source === targetId) nodeNeighbors.add(edge.target)
            if (edge.target === targetId) nodeNeighbors.add(edge.source)
        })
        return nodeNeighbors
    }, [graph.edges, selectedNode, hoverNode])

    // Center on selected node if it changes externally
    useEffect(() => {
        if (selectedNode && fgRef.current) {
            // Find node in graphData (it might have x, y coordinates assigned by engine)
            const node = (graphData.nodes as any[]).find(n => n.id === selectedNode.id)
            if (node && node.x !== undefined && node.y !== undefined) {
                fgRef.current.centerAt(node.x, node.y, 1000)
                fgRef.current.zoom(3, 1000)
            }
        }
    }, [selectedNode])

    const handleNodeClick = useCallback((node: any) => {
        if (onNodeSelect) {
            const originalNode = graph.nodes.find(n => n.id === node.id)
            if (originalNode) onNodeSelect(originalNode)
        }
        fgRef.current?.centerAt(node.x, node.y, 800)
    }, [onNodeSelect, graph])

    const handleLinkClick = useCallback((link: any) => {
        if (onEdgeSelect) {
            const originalEdge = graph.edges.find(e => e.id === link.id)
            if (originalEdge) onEdgeSelect(originalEdge)
        }
    }, [onEdgeSelect, graph])

    // Custom Node Painting
    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const isSelected = selectedNode?.id === node.id
        const isHovered = hoverNode?.id === node.id
        const isNeighbor = neighbors.has(node.id)
        const hasFocus = !!selectedNode || !!hoverNode

        const size = Math.sqrt(node.properties.weight || 1) * 3
        const fontSize = 12 / globalScale

        // Dimming effect
        const alpha = (!hasFocus || isSelected || isHovered || isNeighbor) ? 1 : 0.15

        // Colors from theme
        const baseColor = node.type === 'Article' || node.type === 'protein' ? '#CCFF00' : '#B829EA'

        ctx.save()
        ctx.globalAlpha = alpha

        // Draw Glow
        if (isSelected || isHovered) {
            ctx.shadowBlur = 15 / globalScale
            ctx.shadowColor = baseColor
        }

        // Draw Node Circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
        ctx.fillStyle = baseColor
        ctx.fill()

        // Draw Border for selection
        if (isSelected) {
            ctx.strokeStyle = '#FFFFFF'
            ctx.lineWidth = 2 / globalScale
            ctx.stroke()
        }

        // Draw Label if zoomed in enough or selected
        if (globalScale > 1.5 || isSelected || isHovered) {
            ctx.font = `${fontSize}px Inter, sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#FFFFFF'
            ctx.fillText(node.label || node.id, node.x, node.y + size + fontSize)
        }

        ctx.restore()
    }, [selectedNode, hoverNode, neighbors])

    return (
        <div className="w-full h-full bg-void overflow-hidden relative">
            <ForceGraph2D
                ref={fgRef}
                width={width}
                height={height}
                graphData={graphData}
                backgroundColor="#000000"

                // Node Rendering
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node: any, color, ctx) => {
                    const size = Math.sqrt(node.properties.weight || 1) * 3 + 2
                    ctx.fillStyle = color
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
                    ctx.fill()
                }}

                // Link Styling
                linkColor={(link: any) => {
                    const isFocus = (selectedNode?.id === (link.source.id || link.source)) ||
                        (selectedNode?.id === (link.target.id || link.target)) ||
                        (hoverNode?.id === (link.source.id || link.source)) ||
                        (hoverNode?.id === (link.target.id || link.target))

                    return isFocus ? '#CCFF00' : '#ffffff15'
                }}
                linkWidth={(link: any) => {
                    const isFocus = (selectedNode?.id === (link.source.id || link.source)) ||
                        (selectedNode?.id === (link.target.id || link.target))
                    return isFocus ? 2 : 1
                }}
                linkDirectionalParticles={(link: any) => {
                    return (selectedNode?.id === (link.source.id || link.source)) ? 4 : 0
                }}
                linkDirectionalParticleSpeed={0.01}
                linkDirectionalParticleWidth={3}
                linkDirectionalParticleColor={() => '#CCFF00'}

                // Interaction
                onNodeClick={handleNodeClick}
                onLinkClick={handleLinkClick}
                onNodeHover={setHoverNode}
                cooldownTicks={100}
                onEngineStop={() => {
                    if (!selectedNode) fgRef.current?.zoomToFit(400, 20)
                }}
            />

            {/* Overlay Info */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-acid animate-pulse shadow-glow-acid" />
                    <span className="font-mono text-[10px] text-steel uppercase tracking-tighter">
                        WEBGL_ENGINE_ACTIVE // {graph.nodes.length} UNITS
                    </span>
                </div>
                {selectedNode && (
                    <div className="bg-acid/10 border border-acid/30 backdrop-blur-md px-3 py-1.5 rounded-lg">
                        <div className="text-[9px] font-mono text-acid/60 uppercase">Selected Unit</div>
                        <div className="text-sm font-display font-bold text-white uppercase">{selectedNode.label}</div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 right-4 text-[9px] font-mono text-steel/30 bg-black/40 px-2 py-1 rounded">
                BIO_DIGITAL_FOUNDRY_V2.0
            </div>
        </div>
    )
}
