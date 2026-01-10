import { useRef, useCallback, useMemo } from 'react'
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d'
import { Graph, GraphNode, GraphEdge } from '../../shared/contracts/graph'
import { useTheme } from '@/hooks/useTheme' // Assuming we might have this, or we just use hardcoded values matching our theme

interface GraphViewerWebGLProps {
    graph: Graph
    onNodeSelect?: (node: GraphNode) => void
    onEdgeSelect?: (edge: GraphEdge) => void
    width?: number
    height?: number
}

export default function GraphViewerWebGL({ graph, onNodeSelect, width, height }: GraphViewerWebGLProps) {
    const fgRef = useRef<ForceGraphMethods>()

    // Transform graph data to match ForceGraph expected format (it mutates objects, so we copy)
    const graphData = useMemo(() => {
        return {
            nodes: graph.nodes.map(n => ({ ...n, id: n.id, val: n.weight || 1 })),
            links: graph.edges.map(e => ({ ...e, source: e.source, target: e.target }))
        }
    }, [graph])

    const handleNodeClick = useCallback((node: any) => {
        if (onNodeSelect) {
            // Find original node data to pass back
            const originalNode = graph.nodes.find(n => n.id === node.id)
            if (originalNode) onNodeSelect(originalNode)
        }

        // Center view on node
        fgRef.current?.centerAt(node.x, node.y, 1000)
        fgRef.current?.zoom(4, 2000)
    }, [onNodeSelect, graph])

    return (
        <div className="w-full h-full bg-void overflow-hidden">
            <ForceGraph2D
                ref={fgRef}
                width={width}
                height={height}
                graphData={graphData}
                backgroundColor="#000000" // Void

                // Node Styling
                nodeLabel="label"
                nodeColor={(node: any) => node.type === 'Article' ? '#CCFF00' : '#B829EA'} // Acid / Plasma
                nodeRelSize={6}
                nodeVal={(node: any) => Math.sqrt(node.weight || 1) * 3}

                // Link Styling
                linkColor={() => '#ffffff20'} // White/Transparent
                linkWidth={(link: any) => Math.sqrt(link.weight || 1)}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={() => '#CCFF00'} // Acid flow

                // Interaction
                onNodeClick={handleNodeClick}
                cooldownTicks={100}
                onEngineStop={() => fgRef.current?.zoomToFit(400, 10)}
            />

            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md p-2 rounded text-[10px] text-steel font-mono pointer-events-none">
                RENDERER: WEBGL_CANVAS_2D // NODES: {graph.nodes.length}
            </div>
        </div>
    )
}
