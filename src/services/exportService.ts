/**
 * Graph Export Service
 * Exports graph data to Word (DOCX) and PDF formats
 */

import { Graph, GraphNode, GraphEdge } from '../../shared/types'

interface ExportOptions {
    includeStatistics?: boolean
    includeTopNodes?: boolean
    topNodesCount?: number
    includeEdgesList?: boolean
}

/**
 * Calculate graph statistics
 */
function calculateStats(graph: Graph) {
    const density = graph.nodes.length > 1
        ? (2 * graph.edges.length) / (graph.nodes.length * (graph.nodes.length - 1))
        : 0

    const avgDegree = graph.nodes.length > 0
        ? (2 * graph.edges.length) / graph.nodes.length
        : 0

    // Calculate degree for each node
    const nodeDegrees = new Map<string, number>()
    graph.nodes.forEach(n => nodeDegrees.set(n.id, 0))
    graph.edges.forEach(e => {
        nodeDegrees.set(e.source, (nodeDegrees.get(e.source) || 0) + 1)
        nodeDegrees.set(e.target, (nodeDegrees.get(e.target) || 0) + 1)
    })

    return {
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        density: (density * 100).toFixed(1),
        avgDegree: avgDegree.toFixed(2),
        nodeDegrees
    }
}

/**
 * Export graph to JSON
 */
export function exportToJSON(graph: Graph): string {
    return JSON.stringify(graph, null, 2)
}

/**
 * Export graph to CSV (nodes and edges)
 */
export function exportToCSV(graph: Graph): { nodes: string; edges: string } {
    // Nodes CSV
    const nodesHeader = 'id,label,weight'
    const nodesRows = graph.nodes.map(n =>
        `"${n.id}","${n.label}",${n.weight || 0}`
    )
    const nodesCSV = [nodesHeader, ...nodesRows].join('\n')

    // Edges CSV
    const edgesHeader = 'id,source,target,weight'
    const edgesRows = graph.edges.map(e =>
        `"${e.id}","${e.source}","${e.target}",${e.weight || 0}`
    )
    const edgesCSV = [edgesHeader, ...edgesRows].join('\n')

    return { nodes: nodesCSV, edges: edgesCSV }
}

/**
 * Export graph to Word (DOCX) format
 * Uses docx library
 */
export async function exportToWord(
    graph: Graph,
    options: ExportOptions = {}
): Promise<Blob> {
    const {
        includeStatistics = true,
        includeTopNodes = true,
        topNodesCount = 10,
        includeEdgesList = true
    } = options

    // Dynamic import to avoid SSR issues
    const { Document, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, Packer } = await import('docx')

    const stats = calculateStats(graph)
    const children: any[] = []

    // Title
    children.push(
        new Paragraph({
            text: `Отчёт по графу: ${graph.name}`,
            heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
            text: `Дата создания: ${new Date().toLocaleDateString('ru-RU')}`,
            spacing: { after: 200 },
        })
    )

    // Statistics section
    if (includeStatistics) {
        children.push(
            new Paragraph({
                text: 'Статистика графа',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Количество узлов: ', bold: true }),
                    new TextRun(String(stats.nodeCount)),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Количество связей: ', bold: true }),
                    new TextRun(String(stats.edgeCount)),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Плотность графа: ', bold: true }),
                    new TextRun(`${stats.density}%`),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Средняя степень: ', bold: true }),
                    new TextRun(stats.avgDegree),
                ],
                spacing: { after: 200 },
            })
        )
    }

    // Top nodes section
    if (includeTopNodes) {
        const topNodes = graph.nodes
            .slice()
            .sort((a, b) => (b.weight || 0) - (a.weight || 0))
            .slice(0, topNodesCount)

        children.push(
            new Paragraph({
                text: `Топ-${topNodesCount} узлов по весу`,
                heading: HeadingLevel.HEADING_2,
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: '№', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'ID', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Название', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Вес', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Степень', bold: true })] }),
                        ],
                    }),
                    ...topNodes.map((node, i) =>
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(String(i + 1))] }),
                                new TableCell({ children: [new Paragraph(node.id)] }),
                                new TableCell({ children: [new Paragraph(node.label)] }),
                                new TableCell({ children: [new Paragraph(String(node.weight || 0))] }),
                                new TableCell({ children: [new Paragraph(String(stats.nodeDegrees.get(node.id) || 0))] }),
                            ],
                        })
                    ),
                ],
            })
        )

        children.push(new Paragraph({ text: '', spacing: { after: 200 } }))
    }

    // Edges list
    if (includeEdgesList) {
        children.push(
            new Paragraph({
                text: 'Список связей',
                heading: HeadingLevel.HEADING_2,
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: 'Источник', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Цель', bold: true })] }),
                            new TableCell({ children: [new Paragraph({ text: 'Вес', bold: true })] }),
                        ],
                    }),
                    ...graph.edges.slice(0, 50).map(edge =>
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(edge.source)] }),
                                new TableCell({ children: [new Paragraph(edge.target)] }),
                                new TableCell({ children: [new Paragraph(String(edge.weight || 0))] }),
                            ],
                        })
                    ),
                ],
            })
        )

        if (graph.edges.length > 50) {
            children.push(
                new Paragraph({
                    text: `... и ещё ${graph.edges.length - 50} связей`,
                    italics: true,
                })
            )
        }
    }

    const doc = new Document({
        sections: [{
            properties: {},
            children,
        }],
    })

    return await Packer.toBlob(doc)
}

/**
 * Export graph to PDF format
 * Uses jsPDF library
 */
export async function exportToPDF(
    graph: Graph,
    options: ExportOptions = {}
): Promise<Blob> {
    const {
        includeStatistics = true,
        includeTopNodes = true,
        topNodesCount = 10,
    } = options

    // Dynamic import
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF()
    const stats = calculateStats(graph)
    let y = 20

    // Title
    doc.setFontSize(18)
    doc.text(`Отчёт по графу: ${graph.name}`, 20, y)
    y += 10

    doc.setFontSize(10)
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 20, y)
    y += 15

    // Statistics
    if (includeStatistics) {
        doc.setFontSize(14)
        doc.text('Статистика графа', 20, y)
        y += 8

        doc.setFontSize(10)
        doc.text(`Узлов: ${stats.nodeCount}`, 25, y)
        y += 6
        doc.text(`Связей: ${stats.edgeCount}`, 25, y)
        y += 6
        doc.text(`Плотность: ${stats.density}%`, 25, y)
        y += 6
        doc.text(`Средняя степень: ${stats.avgDegree}`, 25, y)
        y += 15
    }

    // Top nodes
    if (includeTopNodes) {
        const topNodes = graph.nodes
            .slice()
            .sort((a, b) => (b.weight || 0) - (a.weight || 0))
            .slice(0, topNodesCount)

        doc.setFontSize(14)
        doc.text(`Топ-${topNodesCount} узлов`, 20, y)
        y += 8

        doc.setFontSize(9)
        topNodes.forEach((node, i) => {
            if (y > 270) {
                doc.addPage()
                y = 20
            }
            doc.text(`${i + 1}. ${node.label} (вес: ${node.weight || 0})`, 25, y)
            y += 5
        })
    }

    return doc.output('blob')
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
