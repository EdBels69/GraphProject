import { databaseManager } from '../core/Database'
import { v4 as uuidv4 } from 'uuid'
import { graphMethodRegistry } from '../modules/graph/GraphMethodRegistry'

export class SessionManager {
    /**
     * Save a snapshot of the current graph state
     */
    async saveSnapshot(graphId: string, name: string): Promise<any> {
        const client = databaseManager.getClient()

        // 1. Get current graph
        const graph = await client.graph.findUnique({
            where: { id: graphId }
        })

        if (!graph) throw new Error('Graph not found')

        // 2. Count existing snapshots to determine version
        const count = await client.graphSnapshot.count({
            where: { graphId }
        })

        // 3. Serialize graph state
        const graphState = {
            nodes: JSON.parse(graph.nodes as string),
            edges: JSON.parse(graph.edges as string),
            metadata: JSON.parse(graph.metadata as string || '{}')
        }

        // 4. Create snapshot
        const snapshot = await client.graphSnapshot.create({
            data: {
                id: uuidv4(),
                graphId,
                name,
                version: count + 1,
                data: JSON.stringify(graphState),
                metrics: graph.metrics || '{}'
            }
        })

        return snapshot
    }

    /**
     * Restore a graph from a snapshot
     * This overwrites the current graph state with snapshot data
     */
    async restoreSnapshot(snapshotId: string): Promise<any> {
        const client = databaseManager.getClient()

        const snapshot = await client.graphSnapshot.findUnique({
            where: { id: snapshotId }
        })

        if (!snapshot) throw new Error('Snapshot not found')

        const data = JSON.parse(snapshot.data)

        // Update graph with snapshot data
        const updatedGraph = await client.graph.update({
            where: { id: snapshot.graphId },
            data: {
                nodes: JSON.stringify(data.nodes),
                edges: JSON.stringify(data.edges),
                metadata: JSON.stringify(data.metadata),
                metrics: snapshot.metrics || undefined,
                updatedAt: new Date()
            }
        })

        return updatedGraph
    }

    /**
     * List all snapshots for a graph
     */
    async listSnapshots(graphId: string): Promise<any[]> {
        const client = databaseManager.getClient()

        return client.graphSnapshot.findMany({
            where: { graphId },
            orderBy: { version: 'desc' }
        })
    }
}

export const sessionManager = new SessionManager()
