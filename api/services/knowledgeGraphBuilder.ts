import { Entity, ExtractedEntities } from './entityExtractor'
import { Relation, ExtractedRelations } from './relationExtractor'
import { Graph, GraphNode, GraphEdge, NodeType, RelationType, EvidenceType } from '../../shared/types'

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
      includeCooccurrence = true,  // CHANGED: Enable by default for better connectivity
      maxNodes = Infinity
    } = options

    // Filter entities by confidence and mentions
    const filteredEntities = entities.filter(
      e => e.confidence >= minConfidence && e.mentions >= minMentions
    )

    // Filter relations by confidence and type
    const filteredRelations = relations.filter(
      r => r.confidence >= minConfidence &&
        (includeCooccurrence || r.type !== 'cooccurs_with')  // FIXED: match new type name
    )

    console.info(`[KnowledgeGraphBuilder] Input: ${entities.length} entities, ${relations.length} relations`)
    console.info(`[KnowledgeGraphBuilder] Filtered (conf>=${minConfidence}): ${filteredEntities.length} entities, ${filteredRelations.length} relations`)

    // Limit number of nodes if specified
    const sortedEntities = filteredEntities
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, maxNodes)

    // Create nodes from entities with proper type
    const nodes: GraphNode[] = sortedEntities.map(entity => ({
      id: entity.id,
      label: entity.name,
      type: this.mapEntityTypeToNodeType(entity.type),  // NEW: top-level type
      weight: entity.confidence,
      data: {
        type: entity.type,
        confidence: entity.confidence,
        mentions: entity.mentions,
        evidence: entity.evidence,
        source: entity.source
      }
    }))

    // Create edges from relations with proper typing
    const nodeIds = new Set(sortedEntities.map(e => e.id))
    const edges: GraphEdge[] = filteredRelations
      .filter(r => nodeIds.has(r.source) && nodeIds.has(r.target))
      .map(relation => ({
        id: relation.id,
        source: relation.source,
        target: relation.target,
        relation: relation.type as RelationType,  // NEW: top-level relation
        evidenceType: relation.evidenceType || 'text_mining',  // NEW: evidence type
        confidence: relation.confidence,  // NEW: top-level confidence
        weight: relation.confidence,
        directed: true,
        data: {
          label: relation.type,
          type: relation.type,
          confidence: relation.confidence,
          evidence: relation.evidence,
          sourceText: relation.sourceText
        }
      }))

    // Get unique sources
    const sources = [...new Set(sortedEntities.map(e => e.source))]

    return {
      graph: {
        id: `kg_${Date.now()}`,
        name: `Knowledge Graph ${new Date().toISOString()}`,
        nodes,
        edges,
        directed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      metadata: {
        entities: nodes.length,
        relations: edges.length,
        sources,
        createdAt: new Date()
      }
    }
  }

  /**
   * Map entity type string to NodeType enum
   */
  private mapEntityTypeToNodeType(entityType: string): NodeType {
    const typeMap: Record<string, NodeType> = {
      'gene': 'Gene',
      'protein': 'Protein',
      'metabolite': 'Metabolite',
      'chemical': 'Metabolite',
      'compound': 'Metabolite',
      'disease': 'Disease',
      'disorder': 'Disease',
      'pathway': 'Pathway',
      'drug': 'Drug',
      'symptom': 'Symptom',
      'anatomy': 'Anatomy',
      'tissue': 'Anatomy',
      'organ': 'Anatomy'
    }

    const normalized = entityType.toLowerCase()
    return typeMap[normalized] || 'Concept'
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
          // Merge node data
          if (node.data && existing.data) {
            existing.weight = Math.max(existing.weight || 0, node.weight || 0)
            existing.data.confidence = Math.max(
              existing.data.confidence || 0,
              node.data.confidence || 0
            )
            existing.data.mentions = (existing.data.mentions || 0) + (node.data.mentions || 0)
            if (existing.data.evidence && node.data.evidence) {
              existing.data.evidence.push(...node.data.evidence)
              existing.data.evidence = [...new Set(existing.data.evidence)]
            }
          }
        } else {
          mergedNodes.set(node.id, node)
        }
        if (node.data?.source) {
          allSources.add(node.data.source)
        }
      }

      // Merge edges
      for (const edge of kg.graph.edges) {
        const existing = mergedEdges.get(edge.id)
        if (existing) {
          if (edge.data && existing.data) {
            existing.weight = Math.max(existing.weight || 0, edge.weight || 0)
            existing.data.confidence = Math.max(
              existing.data.confidence || 0,
              edge.data.confidence || 0
            )
            if (existing.data.evidence && edge.data.evidence) {
              existing.data.evidence.push(...edge.data.evidence)
              existing.data.evidence = [...new Set(existing.data.evidence)]
            }
          }
        } else {
          mergedEdges.set(edge.id, edge)
        }
      }
    }

    return {
      graph: {
        id: `merged_kg_${Date.now()}`,
        name: `Merged Knowledge Graph ${new Date().toISOString()}`,
        nodes: Array.from(mergedNodes.values()),
        edges: Array.from(mergedEdges.values()),
        directed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
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
      n.data?.type && types.includes(n.data.type)
    )
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredEdges = graph.graph.edges.filter(e =>
      nodeIds.has(e.source) && nodeIds.has(e.target)
    )

    return {
      graph: {
        ...graph.graph,
        nodes: filteredNodes,
        edges: filteredEdges
      },
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

    return {
      graph: {
        ...graph.graph,
        nodes: filteredNodes,
        edges: filteredEdges
      },
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

        return {
          graph: {
            ...graph.graph,
            nodes: pathNodes,
            edges: pathEdges
          },
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
        name: graph.graph.name,
        createdAt: graph.graph.createdAt
      },
      nodes: graph.graph.nodes.map(n => ({
        key: n.id,
        attributes: {
          label: n.label,
          weight: n.weight,
          ...n.data
        }
      })),
      edges: graph.graph.edges.map(e => ({
        key: e.id,
        source: e.source,
        target: e.target,
        attributes: {
          weight: e.weight,
          directed: e.directed,
          ...e.data
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
          <attvalue for="type" value="${n.data?.type || 'unknown'}"/>
          <attvalue for="confidence" value="${n.data?.confidence || 0}"/>
          <attvalue for="mentions" value="${n.data?.mentions || 0}"/>
        </attvalues>
      </node>`
    ).join('\n')

    const edgesXML = graph.graph.edges.map(e =>
      `    <edge id="${e.id}" source="${e.source}" target="${e.target}" label="${e.data?.label || ''}">
        <attvalues>
          <attvalue for="type" value="${e.data?.type || 'unknown'}"/>
          <attvalue for="confidence" value="${e.data?.confidence || 0}"/>
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
