import { GraphMethod, ValidationResult, ConfigSchema } from '../../../shared/contracts/services/graphMethod'
import { Article } from '../../../shared/contracts/article'
import { UniversalGraph, GraphMetrics, GraphNode, GraphEdge } from '../../../shared/contracts/graph'

export class KeywordCoOccurrence implements GraphMethod {
    id = 'keyword-cooccur'
    name = 'Keyword Co-occurrence Network'
    description = 'Builds a network where nodes are keywords and edges represent co-occurrence in the same papers.'
    category = 'bibliometric' as const
    icon = 'tag'

    requiredFields = ['keywords']
    minArticles = 2

    configSchema: ConfigSchema = {
        minFrequency: {
            type: 'number',
            label: 'Minimum Papers per Keyword',
            description: 'Keywords must appear in at least this many papers',
            default: 2,
            min: 1,
            max: 50
        },
        similarityThreshold: {
            type: 'slider',
            label: 'Similarity Threshold (Jaccard)',
            description: 'Minimum overlap required to create an edge',
            default: 0.1,
            min: 0,
            max: 1,
            step: 0.05
        },
        maxKeywordsPerPaper: {
            type: 'number',
            label: 'Max Keywords per Paper',
            description: 'Limit keywords analyzed per paper (topics)',
            default: 10,
            min: 3,
            max: 50
        }
    }

    validate(articles: Article[]): ValidationResult {
        const total = articles.length
        const withKeywords = articles.filter(a => a.keywords && a.keywords.length > 0).length

        return {
            valid: withKeywords >= this.minArticles,
            errors: withKeywords < this.minArticles ? [`Need at least ${this.minArticles} articles with keywords`] : [],
            warnings: [],
            coverage: total > 0 ? withKeywords / total : 0
        }
    }

    async build(articles: Article[], config: any): Promise<UniversalGraph> {
        const minFrequency = config.minFrequency || 2
        const similarityThreshold = config.similarityThreshold || 0.1
        const maxKeywords = config.maxKeywordsPerPaper || 10

        // 1. Extract and normalize keywords
        const keywordCounts = new Map<string, number>()
        const articlesByKeyword = new Map<string, Set<string>>()

        // Helper to normalize keyword
        const normalize = (k: string) => k.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '')

        for (const article of articles) {
            if (!article.keywords || article.keywords.length === 0) continue

            // Use top N keywords
            const uniqueKeywords = new Set<string>()
            article.keywords.slice(0, maxKeywords).forEach(k => {
                const norm = normalize(k)
                if (norm.length > 2) uniqueKeywords.add(norm)
            })

            for (const kw of uniqueKeywords) {
                keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1)

                if (!articlesByKeyword.has(kw)) {
                    articlesByKeyword.set(kw, new Set())
                }
                articlesByKeyword.get(kw)!.add(article.id)
            }
        }

        // 2. Filter nodes by frequency
        const validKeywords = Array.from(keywordCounts.entries())
            .filter(([_, count]) => count >= minFrequency)
            .sort((a, b) => b[1] - a[1]) // Sort by freq desc

        const nodes: GraphNode[] = validKeywords.map(([kw, count]) => ({
            id: `kw_${kw.replace(/\s+/g, '_')}`,
            label: kw,
            type: 'keyword',
            properties: {
                frequency: count,
                source: Array.from(articlesByKeyword.get(kw) || [])
            }
        }))

        // 3. Build edges (Jaccard similarity)
        const edges: GraphEdge[] = []
        const nodeIdMap = new Map(nodes.map(n => [n.label, n.id])) // map keyword -> node id

        for (let i = 0; i < validKeywords.length; i++) {
            for (let j = i + 1; j < validKeywords.length; j++) {
                const [kw1] = validKeywords[i]
                const [kw2] = validKeywords[j]

                const papers1 = articlesByKeyword.get(kw1)!
                const papers2 = articlesByKeyword.get(kw2)!

                // Calculate intersection
                let intersectionSize = 0
                const intersection = new Set<string>()

                // Iterate over smaller set for performance
                const [smaller, larger] = papers1.size < papers2.size ? [papers1, papers2] : [papers2, papers1]

                for (const id of smaller) {
                    if (larger.has(id)) {
                        intersectionSize++
                        intersection.add(id)
                    }
                }

                if (intersectionSize === 0) continue

                // Jaccard Index = intersection / union
                const unionSize = papers1.size + papers2.size - intersectionSize
                const similarity = intersectionSize / unionSize

                if (similarity >= similarityThreshold) {
                    const sourceId = nodeIdMap.get(kw1)!
                    const targetId = nodeIdMap.get(kw2)!

                    edges.push({
                        id: `edge_${sourceId}_${targetId}`,
                        source: sourceId,
                        target: targetId,
                        type: 'co-occurs',
                        properties: {
                            weight: similarity,
                            coOccurrences: intersectionSize,
                            evidence: Array.from(intersection)
                        }
                    })
                }
            }
        }

        const graph: UniversalGraph = {
            id: `graph_${Date.now()}`,
            version: '3.0',
            metadata: {
                name: `Keyword Network (${nodes.length} nodes)`,
                method: this.id,
                source: 'literature',
                domain: 'general',
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                sourceData: {
                    articleCount: articles.length
                }
            },
            nodes,
            edges,
            metrics: {
                nodeCount: nodes.length,
                edgeCount: edges.length,
                density: 0, // Will be computed
                avgDegree: 0,
                components: 0
            }
        }

        graph.metrics = this.getMetrics(graph)
        return graph
    }

    getMetrics(graph: UniversalGraph): GraphMetrics {
        const { nodes, edges } = graph
        const n = nodes.length
        const m = edges.length

        const maxEdges = (n * (n - 1)) / 2
        const density = maxEdges > 0 ? m / maxEdges : 0
        const avgDegree = n > 0 ? (2 * m) / n : 0

        return {
            nodeCount: n,
            edgeCount: m,
            density,
            avgDegree,
            components: 1 // Placeholder
        }
    }
}
