import { UniversalGraph } from '../../../../shared/contracts/graph'
import { Article } from '../../../../shared/contracts/article'
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { databaseManager } from '../../../core/Database'

export class ProjectExporter {
    /**
     * Create a full project export ZIP
     */
    async exportProject(jobId: string, userId: string): Promise<{ filePath: string, filename: string }> {
        const job = await databaseManager.getJob(jobId, userId)
        if (!job) throw new Error('Job not found')

        // Fetch related graph
        let graph: UniversalGraph | null = null
        if (job.graphId) {
            const graphRecord = await databaseManager.getClient().graph.findUnique({
                where: { id: job.graphId }
            })
            if (graphRecord) {
                graph = {
                    id: graphRecord.id,
                    version: '3.0',
                    metadata: JSON.parse(graphRecord.metadata as string || '{}'),
                    nodes: JSON.parse(graphRecord.nodes as string),
                    edges: JSON.parse(graphRecord.edges as string),
                    metrics: JSON.parse(graphRecord.metrics as string || '{}')
                } as any
            }
        }

        // Create ZIP stream
        const filename = `project-${job.topic.replace(/\s+/g, '-')}-${Date.now()}.zip`
        const outputPath = path.join('/tmp', filename)
        const output = fs.createWriteStream(outputPath)
        const archive = archiver('zip', { zlib: { level: 9 } })

        return new Promise((resolve, reject) => {
            output.on('close', () => resolve({ filePath: outputPath, filename }))
            archive.on('error', (err) => reject(err))

            archive.pipe(output)

            // 1. Manifest
            const manifest = {
                version: '1.0',
                createdAt: new Date(),
                job: {
                    id: job.id,
                    topic: job.topic,
                    articleCount: job.articles.length
                },
                graphId: graph?.id
            }
            archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })

            // 2. Articles Data
            archive.append(JSON.stringify(job.articles, null, 2), { name: 'data/articles.json' })

            // 3. Graph Data
            if (graph) {
                archive.append(JSON.stringify(graph, null, 2), { name: 'data/graph.json' })
            }

            // 4. PDFs
            job.articles.forEach((article: any) => {
                if (article.pdfUrl && article.pdfUrl.startsWith('/storage')) {
                    const localPath = path.join(process.cwd(), article.pdfUrl.replace('/storage', 'storage'))
                    if (fs.existsSync(localPath)) {
                        archive.file(localPath, { name: `pdfs/${article.id}.pdf` })
                    }
                }
            })

            archive.finalize()
        })
    }
}

export const projectExporter = new ProjectExporter()
