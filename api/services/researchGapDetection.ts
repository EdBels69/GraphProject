import { Graph, GraphNode, GraphEdge } from '../../shared/contracts/graph'

export interface GapResult {
  id: string
  type: 'structural' | 'temporal' | 'content' | 'confidence'
  description: string
  entities: string[]
  confidence: number
  priority: 'high' | 'medium' | 'low'
  suggestions: string[]
}

export interface GapAnalysisResults {
  structuralGaps: GapResult[]
  temporalGaps: GapResult[]
  contentGaps: GapResult[]
  confidenceGaps: GapResult[]
  summary: {
    totalGaps: number
    byType: Record<string, number>
    byPriority: Record<string, number>
  }
}

export class ResearchGapDetection {
  /**
   * Detect all types of research gaps in a knowledge graph
   */
  detectAllGaps(graph: Graph): GapAnalysisResults {
    const structuralGaps = this.detectStructuralGaps(graph)
    const temporalGaps = this.detectTemporalGaps(graph)
    const contentGaps = this.detectContentGaps(graph)
    const confidenceGaps = this.detectConfidenceGaps(graph)

    const allGaps = [
      ...structuralGaps,
      ...temporalGaps,
      ...contentGaps,
      ...confidenceGaps
    ]

    const byType: Record<string, number> = {}
    const byPriority: Record<string, number> = {}

    for (const gap of allGaps) {
      byType[gap.type] = (byType[gap.type] || 0) + 1
      byPriority[gap.priority] = (byPriority[gap.priority] || 0) + 1
    }

    return {
      structuralGaps,
      temporalGaps,
      contentGaps,
      confidenceGaps,
      summary: {
        totalGaps: allGaps.length,
        byType,
        byPriority
      }
    }
  }

  /**
   * Detect structural gaps: Missing connections between entities
   */
  detectStructuralGaps(graph: Graph): GapResult[] {
    const gaps: GapResult[] = []
    const adjacency = this.buildAdjacencyList(graph)

    // Find disconnected nodes
    for (const node of graph.nodes) {
      const neighbors = adjacency.get(node.id) || new Set()

      // Nodes with no connections
      if (neighbors.size === 0) {
        gaps.push({
          id: `gap-isolated-${node.id}`,
          type: 'structural',
          description: `Isolated node: ${node.label} has no connections`,
          entities: [node.id],
          confidence: 0.9,
          priority: 'high',
          suggestions: [
            `Investigate connections for ${node.label}`,
            `Search for literature mentioning ${node.label}`,
            `Consider adding related entities`
          ]
        })
      }

      // Nodes with very few connections (potential missing links)
      if (neighbors.size === 1 && graph.nodes.length > 10) {
        gaps.push({
          id: `gap-sparse-${node.id}`,
          type: 'structural',
          description: `Sparsely connected node: ${node.label} has only 1 connection`,
          entities: [node.id],
          confidence: 0.7,
          priority: 'medium',
          suggestions: [
            `Investigate additional connections for ${node.label}`,
            `Search for co-occurrences with ${node.label}`
          ]
        })
      }
    }

    // Find pairs of similar entities that are not connected
    const entityTypes = this.groupEntitiesByType(graph)
    for (const [type, entities] of Object.entries(entityTypes)) {
      if (entities.length > 1) {
        for (let i = 0; i < entities.length; i++) {
          for (let j = i + 1; j < entities.length; j++) {
            const entity1 = entities[i]
            const entity2 = entities[j]
            const neighbors1 = adjacency.get(entity1.id) || new Set()

            if (!neighbors1.has(entity2.id)) {
              gaps.push({
                id: `gap-similar-${entity1.id}-${entity2.id}`,
                type: 'structural',
                description: `Similar ${type}s not connected: ${entity1.label} and ${entity2.label}`,
                entities: [entity1.id, entity2.id],
                confidence: 0.6,
                priority: 'low',
                suggestions: [
                  `Investigate potential relationship between ${entity1.label} and ${entity2.label}`,
                  `Search for literature mentioning both entities`
                ]
              })
            }
          }
        }
      }
    }

    return gaps
  }

  /**
   * Detect temporal gaps: Gaps in knowledge over time
   */
  detectTemporalGaps(graph: Graph): GapResult[] {
    const gaps: GapResult[] = []

    // Extract temporal information from node metadata
    const nodesWithTime = graph.nodes.filter(n =>
      (n.properties.year as number) || (n.properties.date as string) || (n.properties.timestamp as string)
    )

    if (nodesWithTime.length < 2) {
      return gaps
    }

    // Group nodes by time periods
    const timeGroups = this.groupNodesByTime(nodesWithTime)
    const timePeriods = Object.keys(timeGroups).sort()

    if (timePeriods.length < 2) {
      return gaps
    }

    // Find time periods with few entities
    const avgEntitiesPerPeriod = nodesWithTime.length / timePeriods.length
    for (const [period, nodes] of Object.entries(timeGroups)) {
      if (nodes.length < avgEntitiesPerPeriod * 0.5) {
        gaps.push({
          id: `gap-temporal-${period}`,
          type: 'temporal',
          description: `Low research activity in ${period}: only ${nodes.length} entities`,
          entities: nodes.map(n => n.id),
          confidence: 0.7,
          priority: 'medium',
          suggestions: [
            `Investigate research gap in ${period}`,
            `Search for historical literature from ${period}`,
            `Consider timeline analysis for these entities`
          ]
        })
      }
    }

    // Find entities that disappeared over time
    const entityAppearances = new Map<string, number[]>()
    for (const [period, nodes] of Object.entries(timeGroups)) {
      for (const node of nodes) {
        const appearances = entityAppearances.get(node.id) || []
        appearances.push(parseInt(period))
        entityAppearances.set(node.id, appearances)
      }
    }

    for (const [entityId, appearances] of entityAppearances) {
      if (appearances.length > 1) {
        const maxPeriod = Math.max(...appearances)
        const lastPeriod = parseInt(timePeriods[timePeriods.length - 1])

        if (maxPeriod < lastPeriod - 1) {
          const node = graph.nodes.find(n => n.id === entityId)
          if (node) {
            gaps.push({
              id: `gap-disappeared-${entityId}`,
              type: 'temporal',
              description: `Entity ${node.label} disappeared after ${maxPeriod}`,
              entities: [entityId],
              confidence: 0.6,
              priority: 'low',
              suggestions: [
                `Investigate why ${node.label} is no longer mentioned`,
                `Search for recent literature about ${node.label}`,
                `Consider if ${node.properties.type} trend changed`
              ]
            })
          }
        }
      }
    }

    return gaps
  }

  /**
   * Detect content gaps: Missing entity types or relations
   */
  detectContentGaps(graph: Graph): GapResult[] {
    const gaps: GapResult[] = []
    const entityTypes = new Set<string>()
    const relationTypes = new Set<string>()

    // Collect all entity and relation types
    for (const node of graph.nodes) {
      if (node.type) {
        entityTypes.add(node.type)
      }
    }

    for (const edge of graph.edges) {
      if (edge.type) {
        relationTypes.add(edge.type)
      }
    }

    // Check for missing expected entity types
    const expectedEntityTypes = ['protein', 'gene', 'metabolite', 'pathway', 'complex', 'disease', 'drug']
    for (const expectedType of expectedEntityTypes) {
      if (!entityTypes.has(expectedType)) {
        gaps.push({
          id: `gap-entity-type-${expectedType}`,
          type: 'content',
          description: `Missing entity type: ${expectedType}`,
          entities: [],
          confidence: 0.8,
          priority: 'high',
          suggestions: [
            `Search for ${expectedType}s in the literature`,
            `Consider adding ${expectedType}s to the analysis`,
            `Review if ${expectedType}s are relevant to the research`
          ]
        })
      }
    }

    // Check for missing expected relation types
    const expectedRelationTypes = ['interacts_with', 'inhibits', 'activates', 'regulates', 'treats', 'causes']
    for (const expectedType of expectedRelationTypes) {
      if (!relationTypes.has(expectedType)) {
        gaps.push({
          id: `gap-relation-type-${expectedType}`,
          type: 'content',
          description: `Missing relation type: ${expectedType}`,
          entities: [],
          confidence: 0.7,
          priority: 'medium',
          suggestions: [
            `Search for ${expectedType} relationships in the literature`,
            `Consider if ${expectedType} relationships are present but not detected`,
            `Review entity extraction patterns`
          ]
        })
      }
    }

    // Check for imbalanced entity type distribution
    const typeCounts: Record<string, number> = {}
    for (const node of graph.nodes) {
      const type = node.type || 'unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }

    const avgCount = graph.nodes.length / Object.keys(typeCounts).length
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count < avgCount * 0.2) {
        gaps.push({
          id: `gap-imbalanced-${type}`,
          type: 'content',
          description: `Underrepresented entity type: ${type} (${count} entities)`,
          entities: graph.nodes.filter(n => n.type === type).map(n => n.id),
          confidence: 0.5,
          priority: 'low',
          suggestions: [
            `Search for more ${type}s to balance the knowledge graph`,
            `Consider if ${type}s are truly rare in the literature`
          ]
        })
      }
    }

    return gaps
  }

  /**
   * Detect confidence gaps: Low-confidence areas requiring validation
   */
  detectConfidenceGaps(graph: Graph): GapResult[] {
    const gaps: GapResult[] = []

    // Find low-confidence entities
    for (const node of graph.nodes) {
      const confidence = (node.properties.confidence as number) || node.properties.weight || 1

      if (confidence < 0.5) {
        gaps.push({
          id: `gap-confidence-entity-${node.id}`,
          type: 'confidence',
          description: `Low confidence entity: ${node.label} (confidence: ${confidence.toFixed(2)})`,
          entities: [node.id],
          confidence: 0.8,
          priority: 'high',
          suggestions: [
            `Manually validate ${node.label}`,
            `Search for additional evidence for ${node.label}`,
            `Review extraction patterns for this entity type`
          ]
        })
      }
    }

    // Find low-confidence relations
    for (const edge of graph.edges) {
      const confidence = (edge.properties.confidence as number) || edge.properties.weight || 1

      if (confidence < 0.5) {
        gaps.push({
          id: `gap-confidence-relation-${edge.id}`,
          type: 'confidence',
          description: `Low confidence relation: ${(edge.properties.type as string) || edge.id} (confidence: ${confidence.toFixed(2)})`,
          entities: [edge.source, edge.target],
          confidence: 0.7,
          priority: 'medium',
          suggestions: [
            `Manually validate this relationship`,
            `Search for additional evidence`,
            `Review relation extraction patterns`
          ]
        })
      }
    }

    // Find entities with few evidence sources
    for (const node of graph.nodes) {
      const evidence = (node.properties.evidence as any[]) || []

      if (evidence.length < 2) {
        gaps.push({
          id: `gap-evidence-${node.id}`,
          type: 'confidence',
          description: `Insufficient evidence: ${node.label} has only ${evidence.length} source(s)`,
          entities: [node.id],
          confidence: 0.6,
          priority: 'low',
          suggestions: [
            `Search for more sources mentioning ${node.label}`,
            `Expand literature search to include more databases`
          ]
        })
      }
    }

    return gaps
  }

  /**
   * Get high priority gaps
   */
  getHighPriorityGaps(gaps: GapResult[]): GapResult[] {
    return gaps.filter(g => g.priority === 'high')
  }

  /**
   * Get gaps by type
   */
  getGapsByType(gaps: GapResult[], type: GapResult['type']): GapResult[] {
    return gaps.filter(g => g.type === type)
  }

  /**
   * Sort gaps by confidence
   */
  sortGapsByConfidence(gaps: GapResult[]): GapResult[] {
    return [...gaps].sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Build adjacency list from graph
   */
  private buildAdjacencyList(graph: Graph): Map<string, Set<string>> {
    const adjacency = new Map<string, Set<string>>()

    for (const node of graph.nodes) {
      adjacency.set(node.id, new Set())
    }

    for (const edge of graph.edges) {
      adjacency.get(edge.source)?.add(edge.target)
      if (!graph.directed) {
        adjacency.get(edge.target)?.add(edge.source)
      }
    }

    return adjacency
  }

  /**
   * Group entities by type
   */
  private groupEntitiesByType(graph: Graph): Record<string, GraphNode[]> {
    const groups: Record<string, GraphNode[]> = {}

    for (const node of graph.nodes) {
      const type = node.type || 'unknown'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(node)
    }

    return groups
  }

  /**
   * Group nodes by time period
   */
  private groupNodesByTime(nodes: GraphNode[]): Record<string, GraphNode[]> {
    const groups: Record<string, GraphNode[]> = {}

    for (const node of nodes) {
      const year = (node.properties.year as number) || (node.properties.metadata as any)?.year
      if (year) {
        const period = Math.floor(year / 5) * 5 // 5-year periods
        const key = `${period}-${period + 4}`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(node)
      }
    }

    return groups
  }
}

export default new ResearchGapDetection()
