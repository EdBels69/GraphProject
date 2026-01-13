import { GraphExporter, ExportResult } from '../../../../shared/contracts/services/exporter'
import { UniversalGraph } from '../../../../shared/contracts/graph'
import { Article } from '../../../../shared/contracts/article'
import archiver from 'archiver'
import { PassThrough } from 'stream'

export class ObsidianExporter implements GraphExporter {
    id = 'obsidian'
    name = 'Obsidian Vault'
    extension = 'zip'
    mimeType = 'application/zip'

    async export(graph: UniversalGraph, options: { articles?: Article[] } = {}): Promise<ExportResult> {
        const { articles = [] } = options

        // Use PassThrough stream to capture buffer
        const stream = new PassThrough()
        const archive = archiver('zip', { zlib: { level: 9 } })

        const chunks: Buffer[] = []

        return new Promise((resolve, reject) => {
            stream.on('data', chunk => chunks.push(chunk))
            stream.on('end', () => {
                const buffer = Buffer.concat(chunks)
                resolve({
                    data: buffer,
                    filename: `${this.sanitize(graph.metadata.name)}-vault.zip`,
                    mimeType: this.mimeType
                })
            })
            archive.on('error', err => reject(err))

            archive.pipe(stream)

            // 1. Create Concepts folder (Nodes)
            graph.nodes.forEach(node => {
                const content = this.generateNodeMarkdown(node, graph)
                archive.append(content, { name: `Concepts/${this.sanitize(node.label)}.md` })
            })

            // 2. Create Papers folder (Articles)
            articles.forEach(article => {
                const content = this.generateArticleMarkdown(article, graph)
                archive.append(content, { name: `Papers/${this.sanitize(article.title)}.md` })
            })

            // 3. Create Index
            const indexContent = `# ${graph.metadata.name}\n\n${graph.metadata.description || ''}\n\n## Statistics\n- Nodes: ${graph.nodes.length}\n- Edges: ${graph.edges.length}\n\n## Concepts\n${graph.nodes.map(n => `- [[${n.label}]]`).join('\n')}`
            archive.append(indexContent, { name: 'Index.md' })

            archive.finalize()
        })
    }

    private generateNodeMarkdown(node: any, graph: UniversalGraph): string {
        const neighbors = graph.edges
            .filter(e => e.source === node.id || e.target === node.id)
            .map(e => {
                const otherId = e.source === node.id ? e.target : e.source
                const otherNode = graph.nodes.find(n => n.id === otherId)
                return otherNode ? `- [[${otherNode.label}]] (${e.type}, w=${e.properties.weight.toFixed(2)})` : ''
            })
            .join('\n')

        return `# ${node.label}\n\n**Type**: ${node.type}\n\n## Relationships\n${neighbors}\n`
    }

    private generateArticleMarkdown(article: Article, graph: UniversalGraph): string {
        const relatedNodes = graph.nodes.filter(n => n.properties.source?.includes(article.id))
        const links = relatedNodes.map(n => `- [[${n.label}]]`).join('\n')

        return `# ${article.title}\n\n**Authors**: ${article.authors.join(', ')}\n**Year**: ${article.year}\n**DOI**: ${article.doi}\n\n## Abstract\n${article.abstract}\n\n## Concepts\n${links}\n`
    }

    private sanitize(str: string): string {
        return str.replace(/[^a-z0-9\s-]/gi, '').trim().substring(0, 100)
    }
}
