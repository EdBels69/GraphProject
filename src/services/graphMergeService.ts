import { Graph, GraphNode, GraphEdge, createGraph } from '../../shared/contracts/graph'

export class GraphMergeService {
    /**
     * Merges multiple graphs into a single graph.
     * Nodes are deduplicated by normalized label (lowercase).
     * Edge weights are summed for identical connections.
     */
    static mergeGraphs(graphs: Graph[], newName: string): Graph {
        if (graphs.length === 0) {
            throw new Error('No graphs provided for merge')
        }

        const mergedGraph = createGraph(newName, graphs[0].directed)
        const nodeMap = new Map<string, GraphNode>()
        const edgeMap = new Map<string, GraphEdge>()

        graphs.forEach(graph => {
            // 1. Merge Nodes
            graph.nodes.forEach(node => {
                const normalizedLabel = node.label.toLowerCase().trim()

                if (nodeMap.has(normalizedLabel)) {
                    // Update existing node
                    const existing = nodeMap.get(normalizedLabel)!
                    const existingWeight = existing.properties.weight || existing.properties.frequency || 1
                    const newWeight = node.properties.weight || node.properties.frequency || 1

                    existing.properties = {
                        ...existing.properties,
                        weight: existingWeight + newWeight,
                        frequency: existingWeight + newWeight
                    }
                    // Merge metadata/data if needed
                    // For now, keep the first one's type/data but accumulate weight
                } else {
                    // Add new node (clone to avoid reference issues)
                    nodeMap.set(normalizedLabel, {
                        ...node,
                        id: node.id,
                        properties: { ...node.properties }
                    })
                }
            })
        })

        // Regenerate IDs based on map to ensure consistency?
        // Or keep the ID of the first node found for that label.
        // Let's refine node map to store by Label, but keep ID of "primary".

        // Re-processing for clean IDs
        const finalNodes: GraphNode[] = []
        const labelToIdMap = new Map<string, string>()

        for (const [label, node] of nodeMap) {
            finalNodes.push(node)
            labelToIdMap.set(label, node.id)
        }

        mergedGraph.nodes = finalNodes

        // 2. Merge Edges
        graphs.forEach(graph => {
            graph.edges.forEach(edge => {
                const sourceNode = graph.nodes.find(n => n.id === edge.source)
                const targetNode = graph.nodes.find(n => n.id === edge.target)

                if (!sourceNode || !targetNode) return

                const sourceLabel = sourceNode.label.toLowerCase().trim()
                const targetLabel = targetNode.label.toLowerCase().trim()

                const newSourceId = labelToIdMap.get(sourceLabel)
                const newTargetId = labelToIdMap.get(targetLabel)

                if (!newSourceId || !newTargetId) return

                // Create a unique key for the edge (sorted if undirected, directed if directed)
                const key = mergedGraph.directed
                    ? `${newSourceId}->${newTargetId}`
                    : [newSourceId, newTargetId].sort().join('-')

                if (edgeMap.has(key)) {
                    const existing = edgeMap.get(key)!
                    const existingWeight = existing.properties.weight || 1
                    const newWeight = edge.properties.weight || 1

                    existing.properties.weight = existingWeight + newWeight
                } else {
                    edgeMap.set(key, {
                        ...edge,
                        id: `merged-edge-${key}`,
                        source: newSourceId,
                        target: newTargetId,
                        properties: { ...edge.properties }
                    })
                }
            })
        })

        mergedGraph.edges = Array.from(edgeMap.values())

        // Update timestamp
        mergedGraph.updatedAt = new Date().toISOString()

        return mergedGraph
    }
}
