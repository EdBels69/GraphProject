
import { describe, it, expect } from 'vitest'
import { createGraph, createNode, createEdge } from '../../shared/contracts/graph'

describe('Graph Contracts', () => {
    it('should create a valid graph', () => {
        const graph = createGraph('Test Graph', true)

        expect(graph.name).toBe('Test Graph')
        expect(graph.directed).toBe(true)
        expect(graph.version).toBe('2.0')
        expect(graph.nodes).toEqual([])
        expect(graph.edges).toEqual([])
        expect(graph.createdAt).toBeDefined()
    })

    it('should create a valid node', () => {
        const node = createNode('n1', 'Node 1', 'protein', { confidence: 0.9 })

        expect(node.id).toBe('n1')
        expect(node.label).toBe('Node 1')
        expect(node.type).toBe('protein')
        expect(node.data.confidence).toBe(0.9)
        expect(node.data.type).toBe('protein') // Factory should set this? Check factory logic.
    })

    it('should create a valid edge', () => {
        const edge = createEdge('e1', 'n1', 'n2', 0.5)

        expect(edge.id).toBe('e1')
        expect(edge.source).toBe('n1')
        expect(edge.target).toBe('n2')
        expect(edge.weight).toBe(0.5)
    })
})
