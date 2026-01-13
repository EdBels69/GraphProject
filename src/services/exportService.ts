/**
 * Graph Export Service
 * Exports graph data to Word (DOCX) and PDF formats
 */

import { Graph } from '../../shared/contracts/graph'
import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType } from 'docx'
import jsPDF from 'jspdf'

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
        const source = nodeDegrees.get(e.source) || 0
        const target = nodeDegrees.get(e.target) || 0
        nodeDegrees.set(e.source, source + 1)
        nodeDegrees.set(e.target, target + 1)
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
        `"${n.id}","${n.label}",${n.properties.weight || 0}`
    )
    const nodesCSV = [nodesHeader, ...nodesRows].join('\n')

    // Edges CSV
    const edgesHeader = 'id,source,target,weight'
    const edgesRows = graph.edges.map(e =>
        `"${e.id}","${e.source}","${e.target}",${e.properties.weight || 0}`
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

    const stats = calculateStats(graph)
    const children: any[] = []

    // Title
    children.push(
        new Paragraph({
            text: `GRAPH_ANALYSIS_REPORT: ${graph.metadata.name}`,
            heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
            text: `Generated: ${new Date().toLocaleDateString('en-US')}`,
            spacing: { after: 200 },
        })
    )

    // Statistics section
    if (includeStatistics) {
        children.push(
            new Paragraph({
                text: 'NETWORK_METRICS',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Node Count: ', bold: true }),
                    new TextRun(String(stats.nodeCount)),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Edge Count: ', bold: true }),
                    new TextRun(String(stats.edgeCount)),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Graph Density: ', bold: true }),
                    new TextRun(`${stats.density}%`),
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Average Degree: ', bold: true }),
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
            .sort((a, b) => (b.properties.weight || 0) - (a.properties.weight || 0))
            .slice(0, topNodesCount)

        children.push(
            new Paragraph({
                text: `TOP_${topNodesCount}_CENTRALITY_NODES`,
                heading: HeadingLevel.HEADING_2,
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'RANK', bold: true })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ID', bold: true })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'LABEL', bold: true })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'WEIGHT', bold: true })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'DEGREE', bold: true })] })] }),
                        ],
                    }),
                    ...topNodes.map((node, i) =>
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(String(i + 1))] }),
                                new TableCell({ children: [new Paragraph(node.id)] }),
                                new TableCell({ children: [new Paragraph(node.label)] }),
                                new TableCell({ children: [new Paragraph(String(node.properties.weight || 0))] }),
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
                text: 'BOND_RELATIONSHIPS',
                heading: HeadingLevel.HEADING_2,
            }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'SOURCE', bold: true })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'TARGET', bold: true })] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'WEIGHT', bold: true })] })] }),
                        ],
                    }),
                    ...graph.edges.slice(0, 50).map(edge =>
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(edge.source)] }),
                                new TableCell({ children: [new Paragraph(edge.target)] }),
                                new TableCell({ children: [new Paragraph(String(edge.properties.weight || 0))] }),
                            ],
                        })
                    ),
                ],
            })
        )

        if (graph.edges.length > 50) {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: `... and ${graph.edges.length - 50} additional links`, italics: true })],
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

    const doc = new jsPDF()
    const stats = calculateStats(graph)
    let y = 20

    // Title
    doc.setFontSize(18)
    doc.text(`GRAPH_ANALYSIS_REPORT: ${graph.metadata.name}`, 20, y)
    y += 10

    doc.setFontSize(10)
    doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, 20, y)
    y += 15

    // Statistics
    if (includeStatistics) {
        doc.setFontSize(14)
        doc.text('NETWORK_METRICS', 20, y)
        y += 8

        doc.setFontSize(10)
        doc.text(`Nodes: ${stats.nodeCount}`, 25, y)
        y += 6
        doc.text(`Bonds: ${stats.edgeCount}`, 25, y)
        y += 6
        doc.text(`Density: ${stats.density}%`, 25, y)
        y += 6
        doc.text(`Average Degree: ${stats.avgDegree}`, 25, y)
        y += 15
    }

    // Top nodes
    if (includeTopNodes) {
        const topNodes = graph.nodes
            .slice()
            .sort((a, b) => (b.properties.weight || 0) - (a.properties.weight || 0))
            .slice(0, topNodesCount)

        doc.setFontSize(14)
        doc.text(`TOP_${topNodesCount}_CENTRALITY_NODES`, 20, y)
        y += 8

        doc.setFontSize(9)
        topNodes.forEach((node, i) => {
            if (y > 270) {
                doc.addPage()
                y = 20
            }
            doc.text(`${i + 1}. ${node.label} (weight: ${node.properties.weight || 0})`, 25, y)
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

/**
 * Export graph to GEXF format (for Gephi)
 */
export function exportToGEXF(graph: Graph): string {
    const escapeXML = (str: string) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

    const now = new Date().toISOString()

    let gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.3" version="1.3">
  <meta lastmodifieddate="${now.split('T')[0]}">
    <creator>Graph Analyser</creator>
    <description>${escapeXML(graph.metadata.name)}</description>
  </meta>
  <graph mode="static" defaultedgetype="${graph.directed ? 'directed' : 'undirected'}">
    <attributes class="node">
      <attribute id="0" title="weight" type="float"/>
      <attribute id="1" title="group" type="string"/>
    </attributes>
    <nodes>
`

    graph.nodes.forEach(node => {
        gexf += `      <node id="${escapeXML(node.id)}" label="${escapeXML(node.label)}">
        <attvalues>
          <attvalue for="0" value="${node.properties.weight || 0}"/>
          <attvalue for="1" value="${escapeXML((node.properties.group as string) || '')}"/>
        </attvalues>
      </node>\n`
    })

    gexf += `    </nodes>
    <edges>
`

    graph.edges.forEach((edge, i) => {
        gexf += `      <edge id="${i}" source="${escapeXML(edge.source)}" target="${escapeXML(edge.target)}" weight="${edge.properties.weight || 1}"/>\n`
    })

    gexf += `    </edges>
  </graph>
</gexf>`

    return gexf
}

/**
 * Export graph to GraphML format
 */
export function exportToGraphML(graph: Graph): string {
    const escapeXML = (str: string) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

    let graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="weight" for="node" attr.name="weight" attr.type="double"/>
  <key id="group" for="node" attr.name="group" attr.type="string"/>
  <key id="edgeweight" for="edge" attr.name="weight" attr.type="double"/>
  <graph id="${escapeXML(graph.id)}" edgedefault="${graph.directed ? 'directed' : 'undirected'}">
`

    graph.nodes.forEach(node => {
        graphml += `    <node id="${escapeXML(node.id)}">
      <data key="label">${escapeXML(node.label)}</data>
      <data key="weight">${node.properties.weight || 0}</data>
      <data key="group">${escapeXML((node.properties.group as string) || '')}</data>
    </node>\n`
    })

    graph.edges.forEach((edge, i) => {
        graphml += `    <edge id="e${i}" source="${escapeXML(edge.source)}" target="${escapeXML(edge.target)}">
      <data key="edgeweight">${edge.properties.weight || 1}</data>
    </edge>\n`
    })

    graphml += `  </graph>
</graphml>`

    return graphml
}

/**
 * Export SVG element to PNG
 */
export async function exportSVGtoPNG(svgElement: SVGSVGElement, width = 1920, height = 1080): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)

        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Could not get canvas context'))
                return
            }

            // White background
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, width, height)

            // Draw SVG
            ctx.drawImage(img, 0, 0, width, height)

            canvas.toBlob(blob => {
                URL.revokeObjectURL(url)
                if (blob) {
                    resolve(blob)
                } else {
                    reject(new Error('Failed to create PNG blob'))
                }
            }, 'image/png')
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('Failed to load SVG'))
        }
        img.src = url
    })
}

/**
 * Export SVG element to SVG file
 */
export function exportToSVGFile(svgElement: SVGSVGElement): Blob {
    const svgData = new XMLSerializer().serializeToString(svgElement)
    return new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
}
