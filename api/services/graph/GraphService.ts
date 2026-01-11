import { logger } from '../../core/Logger'
import { knowledgeGraphBuilder } from '../knowledgeGraphBuilder'
import GraphStorage from '../../../shared/graphStorage'
import { ResearchJob } from '../../../shared/contracts/research'
import { jobManager } from '../jobs/JobManager'
import { entityExtractor } from '../entityExtractor'
import { graphRepository } from '../../repositories/GraphRepository'

export class GraphService {
    /**
     * Finalize and build graph for a job
     * Merges entities, builds graph, saves to DB/Storage, and updates Job object (reference)
     */
    async finalizeGraphForJob(job: ResearchJob, entities: any[], relations: any[]): Promise<void> {
        // Merge entities
        const mergedEntities = entityExtractor.mergeEntities(entities)
        job.extractedEntities = mergedEntities
        job.extractedRelations = relations

        jobManager.log(job.id, 'info', `Extracted ${mergedEntities.length} entities from ${job.articlesProcessed} articles`)

        // Build Graph
        if (mergedEntities.length > 0) {
            try {
                jobManager.log(job.id, 'info', `Building auto-graph for job ${job.id}`)

                const graphRes = await knowledgeGraphBuilder.buildGraph(mergedEntities, relations, {
                    minConfidence: 0.3,
                    includeCooccurrence: true
                })

                    // Associate with user
                    ; (graphRes.graph as any).userId = job.userId

                // Save to DB and Storage
                await graphRepository.save(graphRes.graph as any)
                GraphStorage.save(graphRes.graph as any)

                job.graphId = graphRes.graph.id
                jobManager.log(job.id, 'info', `Auto-graph built: ${job.graphId} for user ${job.userId}`)
            } catch (e) {
                logger.error('GraphService', `Failed to build auto-graph for job ${job.id}`, { error: e })
                // Don't fail the job if graph fails, but log it
            }
        } else {
            jobManager.log(job.id, 'warn', `No entities found for job ${job.id}, skipping graph building`)
        }
    }
}

export const graphService = new GraphService()
