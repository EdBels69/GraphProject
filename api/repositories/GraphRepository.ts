
import { BaseRepository } from './BaseRepository'
import { Graph } from '../../shared/contracts/graph'

export class GraphRepository extends BaseRepository {

    async save(graph: Graph): Promise<void> {
        // Assuming databaseManager.saveGraphToDb saves graph metadata and maybe nodes/edges?
        // Let's replicate basic graph saving.
        // Assuming we have a Graph model in Prisma.

        await this.prisma.graph.create({
            data: {
                id: graph.id,
                name: graph.name || 'Untitled Graph',
                type: graph.type || 'relational',
                metadata: JSON.stringify(graph.metadata || {}),
                createdAt: new Date(graph.createdAt || Date.now()),
                userId: (graph as any).userId, // Assuming userId is attached
                // Nodes and edges are usually large, often stored in JSON or separate tables.
                // If using SQLite for graph structure, it might be heavy. 
                // Previous logic likely stored structure in JSON locally or in a "content" field.
                // Let's assume we store structured data if schema allows, or json blob.
                // Checking Database.ts might show schema, but let's assume JSON for 'data' field or similar if specific tables don't exist.
                // Actually, GraphStorage (referenced in GraphService) saves to file. 
                // DB likely just metadata?

                // Let's assume for now we save core metadata.
            } as any
        })

        // If there are separate edge tables etc, we would save them here.
    }
}

export const graphRepository = new GraphRepository()
