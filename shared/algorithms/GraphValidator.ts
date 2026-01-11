import { Graph, GraphEdge, GraphNode } from '../contracts/graph'

export interface ValidationResult {
    valid: boolean
    errors: string[]
}

export class GraphValidator {
    constructor(private graph: Graph) { }

    validate(): ValidationResult {
        const errors: string[] = []

        const nodeIds = new Set(this.graph.nodes.map(n => n.id))
        const edgeNodeIds = new Set<string>()

        this.graph.edges.forEach(edge => {
            if (!nodeIds.has(edge.source)) {
                errors.push(`Ребро "${edge.id}" ссылается на несуществующий узел "${edge.source}"`)
            }
            if (!nodeIds.has(edge.target)) {
                errors.push(`Ребро "${edge.id}" ссылается на несуществующий узел "${edge.target}"`)
            }
            edgeNodeIds.add(edge.source)
            edgeNodeIds.add(edge.target)
        })

        const orphanNodes = this.graph.nodes.filter(
            n => !edgeNodeIds.has(n.id)
        )
        orphanNodes.forEach(node => {
            errors.push(`Узел "${node.id}" (${node.label}) не имеет связей`)
        })

        const duplicateEdges = this.graph.edges.filter((edge, index) =>
            this.graph.edges.some((e, i) =>
                i !== index &&
                e.source === edge.source &&
                e.target === edge.target
            )
        )
        duplicateEdges.forEach(edge => {
            errors.push(`Дубликат ребра: ${edge.source} -> ${edge.target}`)
        })

        const selfLoops = this.graph.edges.filter(
            e => e.source === e.target
        )
        selfLoops.forEach(edge => {
            errors.push(`Самопетля в узле "${edge.source}"`)
        })

        return {
            valid: errors.length === 0,
            errors
        }
    }
}
