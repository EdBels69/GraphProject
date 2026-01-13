import { GraphExporter, ExportResult } from '../../../../shared/contracts/services/exporter'
import { UniversalGraph } from '../../../../shared/contracts/graph'

export class CytoscapeExporter implements GraphExporter {
    id = 'cytoscape'
    name = 'Cytoscape XGMML'
    extension = 'xgmml'
    mimeType = 'application/xml'

    async export(graph: UniversalGraph): Promise<ExportResult> {
        const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<graph label="${this.escape(graph.metadata.name)}" xmlns="http://www.cs.rpi.edu/XGMML" directed="1">
  <att name="created" value="${new Date().toISOString()}" type="string"/>
  <att name="creator" value="GraphAnalyzer" type="string"/>
  
  ${graph.nodes.map(node => `
  <node id="${node.id}" label="${this.escape(node.label)}">
    <att name="type" value="${node.type}" type="string"/>
    ${Object.entries(node.properties).map(([k, v]) =>
            `<att name="${k}" value="${this.escape(String(v))}" type="string"/>`
        ).join('\n    ')}
    <graphics fill="${node.visual?.color || '#cccccc'}" w="40" h="40"/>
  </node>`).join('')}
  
  ${graph.edges.map(edge => `
  <edge source="${edge.source}" target="${edge.target}" label="${edge.type}">
    <att name="weight" value="${edge.properties.weight}" type="real"/>
    ${Object.entries(edge.properties).map(([k, v]) =>
            k !== 'weight' ? `<att name="${k}" value="${this.escape(String(v))}" type="string"/>` : ''
        ).join('\n    ')}
  </edge>`).join('')}
</graph>`

        return {
            data: xml,
            filename: `${this.sanitize(graph.metadata.name)}.xgmml`,
            mimeType: this.mimeType
        }
    }

    private escape(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    private sanitize(str: string): string {
        return str.replace(/[^a-z0-9\s-]/gi, '').trim().substring(0, 100)
    }
}
