interface ArticleMetadata {
  id: string
  title: string
  authors: string[]
  year: number
  journal?: string
  doi?: string
  pmid?: string
  abstract?: string
  keywords?: string[]
}

interface Entity {
  id: string
  name: string
  type: string
  mentions: number
  confidence: number
}

interface Interaction {
  id: string
  source: string
  target: string
  type: string
  strength: number
  evidence: string[]
}

interface GraphNode {
  id: string
  label: string
  group: string
  attributes: Record<string, any>
}

interface GraphEdge {
  id: string
  source: string
  target: string
  weight: number
  type: string
  attributes?: Record<string, any>
}

interface ExportMetadata {
  exportDate: string
  analysisVersion: string
  totalArticles: number
  totalEntities: number
  totalInteractions: number
  parameters: Record<string, any>
}

interface ExportData {
  metadata: ExportMetadata
  articles: ArticleMetadata[]
  entities: Entity[]
  interactions: Interaction[]
  graph?: {
    nodes: GraphNode[]
    edges: GraphEdge[]
  }
  statistics?: Record<string, any>
}

class ExportDataService {
  exportToJSON(data: ExportData, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    this.downloadBlob(blob, `${filename}.json`)
  }

  exportToCSV(data: any[], filename: string): void {
    if (!data.length) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value)
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    this.downloadBlob(blob, `${filename}.csv`)
  }

  exportToGEXF(data: { nodes: GraphNode[]; edges: GraphEdge[] }, filename: string): void {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <graph mode="static" defaultedgetype="directed">
    <attributes class="node">
      ${this.extractNodeAttributes(data.nodes).map(attr =>
      `<attribute id="${attr}" title="${attr}" type="string"/>`
    ).join('\n      ')}
    </attributes>
    <attributes class="edge">
      ${this.extractEdgeAttributes(data.edges).map(attr =>
      `<attribute id="${attr}" title="${attr}" type="string"/>`
    ).join('\n      ')}
    </attributes>
    <nodes>
      ${data.nodes.map(node => `
        <node id="${node.id}" label="${this.escapeXML(node.label)}">
          <attvalues>
            <attvalue for="group" value="${node.group}"/>
            ${Object.entries(node.attributes || {}).map(([key, value]) =>
      `<attvalue for="${key}" value="${this.escapeXML(String(value))}"/>`
    ).join('\n            ')}
          </attvalues>
        </node>`).join('')}
    </nodes>
    <edges>
      ${data.edges.map(edge => `
        <edge id="${edge.id}" source="${edge.source}" target="${edge.target}" weight="${edge.weight}" label="${edge.type}">
          <attvalues>
            ${Object.entries(edge.attributes || {}).map(([key, value]) =>
      `<attvalue for="${key}" value="${this.escapeXML(String(value))}"/>`
    ).join('\n            ')}
          </attvalues>
        </edge>`).join('')}
    </edges>
  </graph>
</gexf>`

    const blob = new Blob([xml], { type: 'application/gexf+xml' })
    this.downloadBlob(blob, `${filename}.gexf`)
  }

  exportToGraphML(data: { nodes: GraphNode[]; edges: GraphEdge[] }, filename: string): void {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="weight" for="edge" attr.name="weight" attr.type="double"/>
  <key id="group" for="node" attr.name="group" attr.type="string"/>
  ${this.extractNodeAttributes(data.nodes).map(attr =>
      `<key id="${attr}" for="node" attr.name="${attr}" attr.type="string"/>`
    ).join('\n  ')}
  <graph id="G" edgedefault="directed">
    ${data.nodes.map(node => `
    <node id="${this.escapeXML(node.id)}">
      <data key="label">${this.escapeXML(node.label)}</data>
      <data key="group">${this.escapeXML(node.group || '')}</data>
      ${Object.entries(node.attributes || {}).map(([key, value]) =>
      `<data key="${key}">${this.escapeXML(String(value))}</data>`
    ).join('\n      ')}
    </node>`).join('')}
    ${data.edges.map((edge, i) => `
    <edge id="e${i}" source="${this.escapeXML(edge.source)}" target="${this.escapeXML(edge.target)}">
      <data key="weight">${edge.weight || 1}</data>
    </edge>`).join('')}
  </graph>
</graphml>`

    const blob = new Blob([xml], { type: 'application/graphml+xml' })
    this.downloadBlob(blob, `${filename}.graphml`)
  }

  exportToXLSX(data: Record<string, any[]>, filename: string): void {
    const csvContent = Object.entries(data).map(([sheetName, sheetData]) => {
      if (!sheetData.length) return ''

      const headers = Object.keys(sheetData[0])
      return `${sheetName}\n${headers.join(',')}\n${sheetData.map(row =>
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value)
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      ).join('\n')}`
    }).join('\n\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    this.downloadBlob(blob, `${filename}.csv`)
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  private extractNodeAttributes(nodes: GraphNode[]): string[] {
    const attributes = new Set<string>(['group'])
    nodes.forEach(node => {
      Object.keys(node.attributes || {}).forEach(attr => attributes.add(attr))
    })
    return Array.from(attributes)
  }

  private extractEdgeAttributes(edges: GraphEdge[]): string[] {
    const attributes = new Set<string>(['type'])
    edges.forEach(edge => {
      Object.keys(edge.attributes || {}).forEach(attr => attributes.add(attr))
    })
    return Array.from(attributes)
  }
}

export const exportDataService = new ExportDataService()
