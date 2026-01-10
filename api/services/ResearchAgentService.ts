import { Action } from 'rxjs/internal/scheduler/Action';
import { createNode, createEdge, GraphNode, GraphEdge, Graph } from '../../shared/contracts/graph'
import { graphRuntime } from './GraphRuntimeService'
import { externalApiService } from './ExternalApiService'
import { extractEntitiesWithAI } from './aiService'
import { logger } from '../core/Logger'
import { databaseManager } from '../core/Database'
import GraphStorage from '../../shared/graphStorage'

export class ResearchAgentService {
    private static instance: ResearchAgentService

    private constructor() { }

    static getInstance(): ResearchAgentService {
        if (!ResearchAgentService.instance) {
            ResearchAgentService.instance = new ResearchAgentService()
        }
        return ResearchAgentService.instance
    }

    async researchTopic(graphId: string, query: string, userId: string): Promise<{
        articlesFound: number
        entitiesAdded: number
        edgesAdded: number
    }> {
        const graph = await graphRuntime.getOrLoadGraph(graphId, userId)
        if (!graph) throw new Error('Graph not found')

        logger.info('ResearchAgent', `Starting research on "${query}" for graph ${graphId}`)

        // 1. Search for papers
        const articles = await externalApiService.searchArticles(query, 5)
        logger.info('ResearchAgent', `Found ${articles.length} articles`)

        if (articles.length === 0) {
            return { articlesFound: 0, entitiesAdded: 0, edgesAdded: 0 }
        }

        let validEntitiesAdded = 0
        let edgesAdded = 0

        // 2. Process each article
        for (const article of articles) {
            if (!article.abstract) continue

            // Create Article Node
            const articleNodeId = `paper-${article.doi || article.pmid || Math.random().toString(36).substr(2, 9)}`
            if (!graph.nodes.find(n => n.id === articleNodeId)) {
                const articleNode = createNode(
                    articleNodeId,
                    article.title || 'Untitled',
                    'concept',
                    { type: 'article', ...article }, // Store metadata
                    2 // Weight
                )
                graph.nodes.push(articleNode)
            }

            // 3. Extract Entities
            const entities = await extractEntitiesWithAI(article.abstract)

            // 4. Add Entities and Edges
            entities.forEach(entity => {
                const entityId = `entity-${entity.name.toLowerCase().replace(/\s+/g, '-')}`

                // Check existing
                let node = graph.nodes.find(n => n.id === entityId)
                if (!node) {
                    // Try fuzzy match by label? For now, strict ID or exact label match
                    node = graph.nodes.find(n => n.label.toLowerCase() === entity.name.toLowerCase())
                }

                if (!node) {
                    // Create new
                    node = createNode(
                        entityId,
                        entity.name,
                        'entity',
                        { type: entity.type, confidence: entity.confidence },
                        1
                    )
                    graph.nodes.push(node)
                    validEntitiesAdded++
                } else {
                    // Boost existing
                    node.weight = (node.weight || 1) + 1
                }

                // Create Edge: Article -> Entity (Mentions)
                const edgeId = `mention-${articleNodeId}-${node.id}`
                if (!graph.edges.find(e => e.id === edgeId)) {
                    const edge = createEdge(
                        edgeId,
                        articleNodeId,
                        node.id,
                        entity.confidence || 0.8,
                        { type: 'mentions', source: 'auto-research' }
                    )
                    graph.edges.push(edge)
                    edgesAdded++
                }
            })
        }

        // 5. Save Graph
        graph.updatedAt = new Date().toISOString()
        graphRuntime.setGraph(graph)
        GraphStorage.save(graph)
        await databaseManager.saveGraphToDb(graph)

        return {
            articlesFound: articles.length,
            entitiesAdded: validEntitiesAdded,
            edgesAdded
        }
    }
}

export const researchAgent = ResearchAgentService.getInstance()
