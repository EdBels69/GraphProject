import { UniversalGraph } from '../../../../shared/contracts/graph'
import { logger } from '../../core/Logger'

export interface Gap {
    id: string
    source: string
    target: string
    score: number
    reason: string
    type: 'missing_link' | 'potential_cluster' | 'contradiction'
}

export class GapFinder {
    /**
     * Analyze graph to find potential missing links (Research Gaps)
     * Using simple Jaccard Coefficient for link prediction as heuristic
     */
    async findGaps(graph: UniversalGraph): Promise<Gap[]> {
        const gaps: Gap[] = []
        const nodes = graph.nodes
        const edges = graph.edges

        // Build adjacency list
        const adjacency = new Map<string, Set<string>>()
        nodes.forEach(n => adjacency.set(n.id, new Set()))
        edges.forEach(e => {
            adjacency.get(e.source)?.add(e.target)
            adjacency.get(e.target)?.add(e.source) // Undirected for analysis
        })

        // Compare all non-connected pairs
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const u = nodes[i]
                const v = nodes[j]

                // Skip if already connected
                if (adjacency.get(u.id)?.has(v.id)) continue

                // Calculate Jaccard Similarity of neighbors
                const neighborsU = adjacency.get(u.id)!
                const neighborsV = adjacency.get(v.id)!

                const intersection = new Set([...neighborsU].filter(x => neighborsV.has(x)))
                const union = new Set([...neighborsU, ...neighborsV])

                if (union.size === 0) continue

                const score = intersection.size / union.size

                // Threshold for "Graph Gap"
                if (score > 0.3) {
                    gaps.push({
                        id: `gap-${u.id}-${v.id}`,
                        source: u.id,
                        target: v.id,
                        score,
                        reason: `High neighborhood overlap (${(score * 100).toFixed(1)}%). Mentions common concepts but not linked directly.`,
                        type: 'missing_link'
                    })
                }
            }
        }

        return gaps.sort((a, b) => b.score - a.score).slice(0, 20) // Top 20 gaps
    }
}

export const gapFinder = new GapFinder()
