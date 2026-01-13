import { Entity, ExtractedEntities } from './entityExtractor'
import { Relation, ExtractedRelations } from './relationExtractor'
import { Graph, GraphNode, GraphEdge, createGraph, createNode, createEdge } from '../../shared/contracts/graph'

export interface KnowledgeGraph {
  graph: Graph
  metadata: {
    entities: number
    relations: number
    sources: string[]
    createdAt: Date
  }
}

export interface BuildOptions {
  minConfidence?: number
  minMentions?: number
  includeCooccurrence?: boolean
  maxNodes?: number
}

export class KnowledgeGraphBuilder {
  /**
   * Build knowledge graph from extracted entities and relations
   */
  async buildGraph(
    entities: Entity[],
    relations: Relation[],
    options: BuildOptions = {}
  ): Promise<KnowledgeGraph> {
    const {
      minConfidence = 0.3,
      minMentions = 1,
      includeCooccurrence = true,
      maxNodes = Infinity
    } = options

    // Filter entities by confidence and mentions
    const filteredEntities = entities.filter(
      e => e.confidence >= minConfidence && e.mentions >= minMentions
    )

    // Filter relations by confidence and type
    const filteredRelations = relations.filter(
      r => r.confidence >= minConfidence &&
        (includeCooccurrence || r.type !== 'cooccurs_with')
    )

    console.info(`[KnowledgeGraphBuilder] Input: ${entities.length} entities, ${relations.length} relations`)
    console.info(`[KnowledgeGraphBuilder] Filtered (conf>=${minConfidence}): ${filteredEntities.length} entities, ${filteredRelations.length} relations`)

    // Limit number of nodes if specified
    const sortedEntities = filteredEntities
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, maxNodes)

    // Create nodes from entities with proper type
    const nodes: GraphNode[] = sortedEntities.map(entity => {
      const node = createNode(entity.id, entity.name, entity.type)
      node.properties = {
        weight: entity.confidence,
        confidence: entity.confidence,
        mentions: entity.mentions,
        evidence: entity.evidence,
        source: entity.source
      }
      return node
    })

    // Create edges from relations with proper typing
    const nodeIds = new Set(sortedEntities.map(e => e.id))
    const edges: GraphEdge[] = filteredRelations
      .filter(r => nodeIds.has(r.source) && nodeIds.has(r.target))
      .map(relation => {
        const edge = createEdge(relation.source, relation.target, relation.type, relation.confidence)
        edge.id = relation.id
        edge.properties = {
          weight: relation.confidence,
          confidence: relation.confidence,
          evidence: relation.evidence || [],
          sourceText: relation.sourceText
        }
        return edge
      })

    // Get unique sources
    const sources = [...new Set(sortedEntities.map(e => e.source))].map(s => ({
      id: s,
      type: 'manual' as const
    }))

    const graph = createGraph(`Knowledge Graph ${new Date().toISOString()}`, true)
    graph.nodes = nodes
    graph.edges = edges
    graph.metadata.sources = sources
    graph.updatedAt = new Date().toISOString()

    return {
      graph,
      metadata: {
        entities: nodes.length,
        relations: edges.length,
        sources: sources.map(s => s.id),
        createdAt: new Date()
      }
    }
  }

  /**
   * Merge multiple knowledge graphs
   */
  mergeGraphs(graphs: KnowledgeGraph[]): KnowledgeGraph {
    const mergedNodes: Map<string, GraphNode> = new Map()
    const mergedEdges: Map<string, GraphEdge> = new Map()
    const allSources: Set<string> = new Set()

    for (const kg of graphs) {
      // Merge nodes
      for (const node of kg.graph.nodes) {
        const existing = mergedNodes.get(node.id)
        if (existing) {
          // Merge node properties
          existing.properties.weight = Math.max(existing.properties.weight || 0, node.properties.weight || 0)
          existing.properties.confidence = Math.max(
            (existing.properties.confidence as number) || 0,
            (node.properties.confidence as number) || 0
          )
          const existingMentions = (existing.properties.mentions as number) || 0
          const nodeMentions = (node.properties.mentions as number) || 0
          existing.properties.mentions = existingMentions + nodeMentions
        } else {
          mergedNodes.set(node.id, JSON.parse(JSON.stringify(node))) // Deep clone
        }

        if (node.properties.source) {
          allSources.add(node.properties.source as string)
        }
      }

      // Merge edges
      for (const edge of kg.graph.edges) {
        const existing = mergedEdges.get(edge.id)
        if (existing) {
          existing.properties.weight = Math.max(existing.properties.weight || 0, edge.properties.weight || 0)
        } else {
          mergedEdges.set(edge.id, JSON.parse(JSON.stringify(edge)))
        }
      }
    }

    const mergedGraph = createGraph(`Merged Knowledge Graph ${new Date().toISOString()}`, true)
    mergedGraph.nodes = Array.from(mergedNodes.values())
    mergedGraph.edges = Array.from(mergedEdges.values())
    mergedGraph.metadata.sources = Array.from(allSources).map(s => ({ id: s, type: 'manual' as const }))
    mergedGraph.updatedAt = new Date().toISOString()

    return {
      graph: mergedGraph,
      metadata: {
        entities: mergedNodes.size,
        relations: mergedEdges.size,
        sources: Array.from(allSources),
        createdAt: new Date()
      }
    }
  }

  /**
   * Filter graph by entity type
   */
  filterByType(graph: KnowledgeGraph, types: string[]): KnowledgeGraph {
    const filteredNodes = graph.graph.nodes.filter(n =>
      n.type && types.includes(n.type)
    )
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredEdges = graph.graph.edges.filter(e =>
      nodeIds.has(e.source) && nodeIds.has(e.target)
    )

    const newGraph = JSON.parse(JSON.stringify(graph.graph)) as Graph
    newGraph.nodes = filteredNodes
    newGraph.edges = filteredEdges

    return {
      graph: newGraph,
      metadata: {
        ...graph.metadata,
        entities: filteredNodes.length,
        relations: filteredEdges.length
      }
    }
  }

  /**
   * Get subgraph around a node (ego network)
   */
  getEgoNetwork(graph: KnowledgeGraph, nodeId: string, depth: number = 1): KnowledgeGraph {
    const includedNodeIds = new Set<string>()
    const queue: string[] = [nodeId]

    // BFS to find nodes within depth
    for (let i = 0; i < depth && queue.length > 0; i++) {
      const levelSize = queue.length
      for (let j = 0; j < levelSize; j++) {
        const currentId = queue.shift()!
        if (includedNodeIds.has(currentId)) continue

        includedNodeIds.add(currentId)

        // Find neighbors
        const neighbors = graph.graph.edges
          .filter(e => e.source === currentId || e.target === currentId)
          .map(e => e.source === currentId ? e.target : e.source)

        for (const neighbor of neighbors) {
          if (!includedNodeIds.has(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
    }

    const filteredNodes = graph.graph.nodes.filter(n => includedNodeIds.has(n.id))
    const filteredEdges = graph.graph.edges.filter(e =>
      includedNodeIds.has(e.source) && includedNodeIds.has(e.target)
    )

    const newGraph = JSON.parse(JSON.stringify(graph.graph)) as Graph
    newGraph.nodes = filteredNodes
    newGraph.edges = filteredEdges

    return {
      graph: newGraph,
      metadata: {
        ...graph.metadata,
        entities: filteredNodes.length,
        relations: filteredEdges.length
      }
    }
  }

  /**
   * Get shortest path between two nodes
   */
  getShortestPath(graph: KnowledgeGraph, sourceId: string, targetId: string): KnowledgeGraph | null {
    const adjacency = new Map<string, Map<string, GraphEdge>>()

    // Build adjacency list
    for (const edge of graph.graph.edges) {
      if (!adjacency.has(edge.source)) {
        adjacency.set(edge.source, new Map())
      }
      if (!adjacency.has(edge.target)) {
        adjacency.set(edge.target, new Map())
      }
      adjacency.get(edge.source)!.set(edge.target, edge)
      adjacency.get(edge.target)!.set(edge.source, edge)
    }

    // BFS to find shortest path
    const visited = new Set<string>()
    const previous = new Map<string, { nodeId: string; edge: GraphEdge }>()
    const queue: string[] = [sourceId]
    visited.add(sourceId)

    while (queue.length > 0) {
      const current = queue.shift()!

      if (current === targetId) {
        // Reconstruct path
        const pathNodeIds: string[] = []
        const pathEdges: GraphEdge[] = []
        let currentId = targetId

        while (currentId !== sourceId) {
          pathNodeIds.push(currentId)
          const prev = previous.get(currentId)!
          pathEdges.push(prev.edge)
          currentId = prev.nodeId
        }
        pathNodeIds.push(sourceId)
        pathNodeIds.reverse()
        pathEdges.reverse()

        const pathNodes = graph.graph.nodes.filter(n => pathNodeIds.includes(n.id))

        const newGraph = JSON.parse(JSON.stringify(graph.graph)) as Graph
        newGraph.nodes = pathNodes
        newGraph.edges = pathEdges

        return {
          graph: newGraph,
          metadata: {
            ...graph.metadata,
            entities: pathNodes.length,
            relations: pathEdges.length
          }
        }
      }

      const neighbors = adjacency.get(current)
      if (neighbors) {
        for (const [neighborId, edge] of neighbors) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId)
            previous.set(neighborId, { nodeId: current, edge })
            queue.push(neighborId)
          }
        }
      }
    }

    return null // No path found
  }

  /**
   * Export graph to JSON
   */
  exportToJSON(graph: KnowledgeGraph): string {
    return JSON.stringify(graph, null, 2)
  }

  /**
   * Export graph to Graphology format
   */
  exportToGraphology(graph: KnowledgeGraph): any {
    return {
      attributes: {
        name: graph.graph.metadata.name,
        createdAt: graph.graph.metadata.created
      },
      nodes: graph.graph.nodes.map(n => ({
        key: n.id,
        attributes: {
          label: n.label,
          weight: n.properties.weight,
          ...n.properties
        }
      })),
      edges: graph.graph.edges.map(e => ({
        key: e.id,
        source: e.source,
        target: e.target,
        attributes: {
          weight: e.properties.weight,
          directed: true,
          ...e.properties
        }
      }))
    }
  }

  /**
   * Export graph to GEXF format (for Gephi)
   */
  exportToGEXF(graph: KnowledgeGraph): string {
    const nodesXML = graph.graph.nodes.map(n =>
      `    <node id="${n.id}" label="${n.label}">
        <attvalues>
          <attvalue for="type" value="${n.type || 'unknown'}"/>
          <attvalue for="confidence" value="${n.properties.confidence || 0}"/>
          <attvalue for="mentions" value="${n.properties.mentions || 0}"/>
        </attvalues>
      </node>`
    ).join('\n')

    const edgesXML = graph.graph.edges.map(e =>
      `    <edge id="${e.id}" source="${e.source}" target="${e.target}" label="${(e.properties.type as any) || ''}">
        <attvalues>
          <attvalue for="type" value="${e.properties?._type || 'unknown'}"/>
          <attvalue for="confidence" value="${e.properties.confidence || 0}"/>
        </attvalues>
      </edge>`
    ).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
      <attribute id="type" title="type" type="string"/>
      <attribute id="confidence" title="confidence" type="double"/>
      <attribute id="mentions" title="mentions" type="integer"/>
    </attributes>
    <attributes class="edge">
      <attribute id="type" title="type" type="string"/>
      <attribute id="confidence" title="confidence" type="double"/>
    </attributes>
    <nodes>
${nodesXML}
    </nodes>
    <edges>
${edgesXML}
    </edges>
  </graph>
</gexf>`
  }
}

export const knowledgeGraphBuilder = new KnowledgeGraphBuilder()
