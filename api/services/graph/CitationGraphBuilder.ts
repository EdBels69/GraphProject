
import { Graph, GraphNode, GraphEdge } from '../../../shared/contracts/graph'
import { ResearchJob } from '../../../shared/contracts/research'

export class CitationGraphBuilder {

    /**
     * Build citation graph from job articles
     */
    buildGraph(job: ResearchJob): Graph {
        const nodes: GraphNode[] = []
        const edges: GraphEdge[] = []

        if (!job.articles) {
            return {
                id: `citation-${job.id}`,
                name: `Citation Network: ${job.topic}`,
                nodes: [],
                edges: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: '1.0',
                sources: [],
                directed: true,

            }
        }

        // 1. Create Nodes
        const articleMap = new Map<string, string>() // DOI -> NodeID

        job.articles.forEach((article, index) => {
            const nodeId = `article-${index}`
            articleMap.set(article.doi?.toLowerCase() || '', nodeId)

            // Determine size based on local citation count (in-degree usually, but here global citations)
            const size = 10 + Math.log(article.citations || 1) * 2

            nodes.push({
                id: nodeId,
                label: article.title.slice(0, 30) + (article.title.length > 30 ? '...' : ''),
                type: 'paper',
                properties: {
                    confidence: 1,
                    mentions: 1,
                    source: 'citation-graph',
                    metadata: {
                        fullTitle: article.title,
                        doi: article.doi,
                        year: article.year,
                        authors: article.authors,
                        globalCitations: article.citations
                    }
                },
                visual: {
                    size: Math.min(size, 40),
                    color: '#3b82f6'
                }
            })
        })

        // 2. Create Edges
        job.articles.forEach((article) => {
            if (!article.references || !article.doi) return

            const sourceId = articleMap.get(article.doi.toLowerCase())
            if (!sourceId) return

            article.references.forEach(refDoi => {
                const targetId = articleMap.get(refDoi.toLowerCase())
                if (targetId) {
                    // Create edge: Source cites Target
                    edges.push({
                        id: `${sourceId}-${targetId}`,
                        source: sourceId,
                        target: targetId,
                        properties: {
                            weight: 1,
                            type: 'cites',
                            confidence: 1,
                            evidence: []
                        }
                    })
                }
            })
        })

        return {
            id: `citation-${job.id}`,
            name: `Citation Network: ${job.topic}`,
            nodes,
            edges,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: '1.0',
            sources: [],
            directed: true,

        }
    }
}

export const citationGraphBuilder = new CitationGraphBuilder()
