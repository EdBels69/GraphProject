import { Graph } from '../../shared/contracts/graph'
import { logger } from '../core/Logger'

export function generateGEXF(graph: Graph): string {
  const escapeXml = (s: string) =>
    s.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  let gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.3" 
      xmlns:viz="http://www.gexf.net/1.3/viz"
      version="1.3">
  <meta lastmodifieddate="${new Date().toISOString().split('T')[0]}">
    <creator>Graph Analyser</creator>
    <description>${escapeXml(graph.metadata.name)}</description>
  </meta>
  <graph mode="static" defaultedgetype="${graph.directed ? 'directed' : 'undirected'}">
    <attributes class="node">
      <attribute id="0" title="type" type="string"/>
      <attribute id="1" title="weight" type="float"/>
    </attributes>
    <attributes class="edge">
      <attribute id="0" title="relation" type="string"/>
      <attribute id="1" title="confidence" type="float"/>
    </attributes>
    <nodes>`

  graph.nodes.forEach(node => {
    const weight = node.properties.weight || 1
    const type = node.type || 'entity'
    gexf += `
      <node id="${escapeXml(node.id)}" label="${escapeXml(node.label)}">
        <attvalues>
          <attvalue for="0" value="${escapeXml(type)}"/>
          <attvalue for="1" value="${weight}"/>
        </attvalues>
        <viz:size value="${Math.max(10, (typeof weight === 'number' ? weight : 1) * 5)}"/>
      </node>`
  })

  gexf += `
    </nodes>
    <edges>`

  graph.edges.forEach((edge, index) => {
    const weight = edge.properties.weight || 1
    const relation = edge.type || 'related'
    gexf += `
      <edge id="${edge.id || index}" source="${escapeXml(edge.source)}" target="${escapeXml(edge.target)}" weight="${weight}">
        <attvalues>
          <attvalue for="0" value="${escapeXml(relation)}"/>
          <attvalue for="1" value="${edge.properties.confidence || 1}"/>
        </attvalues>
      </edge>`
  })

  gexf += `
    </edges>
  </graph>
</gexf>`

  return gexf
}

export async function generatePDF(graph: Graph): Promise<Buffer> {
  // Dynamic import jspdf
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF()
  let y = 20

  // Calculate statistics
  const stats = {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    density: graph.nodes.length > 1
      ? ((2 * graph.edges.length) / (graph.nodes.length * (graph.nodes.length - 1)) * 100).toFixed(1)
      : '0.0',
    avgDegree: graph.nodes.length > 0
      ? ((2 * graph.edges.length) / graph.nodes.length).toFixed(2)
      : '0.00'
  }

  // Title
  doc.setFontSize(18)
  doc.text(`Graph Report: ${graph.metadata.name}`, 20, y)
  y += 10

  doc.setFontSize(10)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y)
  y += 15

  // Statistics
  doc.setFontSize(14)
  doc.text('Graph Statistics', 20, y)
  y += 8

  doc.setFontSize(10)
  doc.text(`Nodes: ${stats.nodeCount}`, 25, y)
  y += 6
  doc.text(`Edges: ${stats.edgeCount}`, 25, y)
  y += 6
  doc.text(`Density: ${stats.density}%`, 25, y)
  y += 6
  doc.text(`Average Degree: ${stats.avgDegree}`, 25, y)
  y += 15

  // Top nodes
  const topNodes = graph.nodes
    .slice()
    .sort((a, b) => ((b.properties.weight as number) || 0) - ((a.properties.weight as number) || 0))
    .slice(0, 10)

  doc.setFontSize(14)
  doc.text('Top 10 Nodes by Weight', 20, y)
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

  return Buffer.from(doc.output('arraybuffer'))
}
