import { describe, it, expect, beforeEach } from 'vitest'
import { GraphAnalyzer, createGraph, createNode, createEdge } from './graphAlgorithms'
import { Graph, GraphNode, GraphEdge } from './types'

describe('GraphAnalyzer', () => {
  let testGraph: Graph
  let analyzer: GraphAnalyzer

  beforeEach(() => {
    testGraph = createGraph('Test Graph')
    const node1 = createNode('node1', 'Node 1', 5)
    const node2 = createNode('node2', 'Node 2', 3)
    const node3 = createNode('node3', 'Node 3', 7)
    const node4 = createNode('node4', 'Node 4', 2)

    testGraph.nodes.push(node1, node2, node3, node4)

    const edge1 = createEdge(testGraph.id, 'node1', 'node2', 2)
    const edge2 = createEdge(testGraph.id, 'node2', 'node3', 1)
    const edge3 = createEdge(testGraph.id, 'node3', 'node4', 3)
    const edge4 = createEdge(testGraph.id, 'node4', 'node1', 1)

    testGraph.edges.push(edge1, edge2, edge3, edge4)

    analyzer = new GraphAnalyzer(testGraph)
  })

  describe('findShortestPath', () => {
    it('should find shortest path between connected nodes', () => {
      const result = analyzer.findShortestPath('node1', 'node3')

      expect(result).not.toBeNull()
      expect(result?.path).toEqual(['node1', 'node2', 'node3'])
      expect(result?.totalWeight).toBe(3)
      expect(result?.length).toBe(3)
    })

    it('should return null for non-existent path', () => {
      const node5 = createNode('node5', 'Isolated Node')
      testGraph.nodes.push(node5)

      const result = analyzer.findShortestPath('node1', 'node5')

      expect(result).toBeNull()
    })

    it('should find path with zero weight', () => {
      const result = analyzer.findShortestPath('node1', 'node2')

      expect(result).not.toBeNull()
      expect(result?.totalWeight).toBe(2)
    })
  })

  describe('findAllShortestPaths', () => {
    it('should find all shortest paths between all node pairs', () => {
      const allPaths = analyzer.findAllShortestPaths()

      expect(allPaths.size).toBeGreaterThan(0)
      expect(allPaths.has('node1')).toBe(true)
      expect(allPaths.get('node1')?.has('node3')).toBe(true)
    })
  })

  describe('calculateCentrality', () => {
    it('should calculate centrality metrics for all nodes', () => {
      const results = analyzer.calculateCentrality()

      expect(results.length).toBe(testGraph.nodes.length)
      expect(results[0]).toHaveProperty('degree')
      expect(results[0]).toHaveProperty('betweenness')
      expect(results[0]).toHaveProperty('closeness')
      expect(results[0]).toHaveProperty('eigenvector')
    })

    it('should calculate higher degree for more connected nodes', () => {
      const results = analyzer.calculateCentrality()
      const node1Result = results.find(r => r.nodeId === 'node1')
      const node4Result = results.find(r => r.nodeId === 'node4')

      expect(node1Result?.degree).toBeGreaterThan(node4Result?.degree || 0)
    })
  })

  describe('checkConnectivity', () => {
    it('should identify connected graph', () => {
      const result = analyzer.checkConnectivity()

      expect(result.connected).toBe(true)
      expect(result.components).toBe(1)
      expect(result.largestComponent).toBe(testGraph.nodes.length)
    })

    it('should identify disconnected graph', () => {
      const isolatedNode = createNode('isolated', 'Isolated')
      testGraph.nodes.push(isolatedNode)

      const disconnectedAnalyzer = new GraphAnalyzer(testGraph)
      const result = disconnectedAnalyzer.checkConnectivity()

      expect(result.connected).toBe(false)
      expect(result.components).toBeGreaterThan(1)
    })
  })

  describe('calculateStatistics', () => {
    it('should calculate basic statistics', () => {
      const stats = analyzer.calculateStatistics()

      expect(stats.totalNodes).toBe(testGraph.nodes.length)
      expect(stats.totalEdges).toBe(testGraph.edges.length)
      expect(stats.density).toBeGreaterThan(0)
      expect(stats.density).toBeLessThan(1)
      expect(stats.averageDegree).toBeGreaterThan(0)
    })

    it('should calculate clustering coefficient', () => {
      const stats = analyzer.calculateStatistics()

      expect(stats.clusteringCoefficient).toBeGreaterThanOrEqual(0)
      expect(stats.clusteringCoefficient).toBeLessThanOrEqual(1)
    })
  })

  describe('addNode', () => {
    it('should add node to graph', () => {
      const initialLength = testGraph.nodes.length
      const newNode = createNode('newNode', 'New Node', 10)

      analyzer.addNode(newNode)

      expect(testGraph.nodes.length).toBe(initialLength + 1)
      expect(testGraph.nodes).toContain(newNode)
    })
  })

  describe('addEdge', () => {
    it('should add edge to graph', () => {
      const initialLength = testGraph.edges.length
      const newEdge = createEdge(testGraph.id, 'node1', 'node4', 5)

      analyzer.addEdge(newEdge)

      expect(testGraph.edges.length).toBe(initialLength + 1)
      expect(testGraph.edges).toContain(newEdge)
    })
  })

  describe('removeNode', () => {
    it('should remove node and its edges from graph', () => {
      const initialNodeLength = testGraph.nodes.length
      const initialEdgeLength = testGraph.edges.length

      analyzer.removeNode('node2')

      expect(testGraph.nodes.length).toBe(initialNodeLength - 1)
      expect(testGraph.edges.length).toBeLessThan(initialEdgeLength)
      expect(testGraph.nodes.find(n => n.id === 'node2')).toBeUndefined()
    })
  })

  describe('removeEdge', () => {
    it('should remove edge from graph', () => {
      const initialLength = testGraph.edges.length

      analyzer.removeEdge(testGraph.edges[0].id)

      expect(testGraph.edges.length).toBe(initialLength - 1)
      expect(testGraph.edges.find(e => e.id === testGraph.edges[0].id)).toBeUndefined()
    })
  })

  describe('validate', () => {
    it('should pass validation for valid graph', () => {
      const validation = analyzer.validate()

      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect orphan nodes', () => {
      const orphan = createNode('orphan', 'Orphan Node')
      testGraph.nodes.push(orphan)

      const newAnalyzer = new GraphAnalyzer(testGraph)
      const validation = newAnalyzer.validate()

      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('не имеет связей'))).toBe(true)
    })

    it('should detect self-loops', () => {
      const loop = createEdge(testGraph.id, 'node1', 'node1', 1)
      testGraph.edges.push(loop)

      const newAnalyzer = new GraphAnalyzer(testGraph)
      const validation = newAnalyzer.validate()

      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('Самопетля'))).toBe(true)
    })

    it('should detect duplicate edges', () => {
      const duplicate = createEdge(testGraph.id, 'node1', 'node2', 2)
      testGraph.edges.push(duplicate)

      const newAnalyzer = new GraphAnalyzer(testGraph)
      const validation = newAnalyzer.validate()

      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('Дубликат'))).toBe(true)
    })

    it('should detect edges to non-existent nodes', () => {
      const invalidEdge = createEdge(testGraph.id, 'node1', 'nonexistent', 1)
      testGraph.edges.push(invalidEdge)

      const newAnalyzer = new GraphAnalyzer(testGraph)
      const validation = newAnalyzer.validate()

      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('несуществующий'))).toBe(true)
    })
  })
})

describe('createGraph', () => {
  it('should create graph with correct properties', () => {
    const graph = createGraph('Test Graph', true)

    expect(graph).toHaveProperty('id')
    expect(graph).toHaveProperty('name')
    expect(graph).toHaveProperty('nodes')
    expect(graph).toHaveProperty('edges')
    expect(graph).toHaveProperty('directed')
    expect(graph).toHaveProperty('createdAt')
    expect(graph).toHaveProperty('updatedAt')
    expect(graph.name).toBe('Test Graph')
    expect(graph.directed).toBe(true)
    expect(graph.nodes).toEqual([])
    expect(graph.edges).toEqual([])
  })

  it('should create undirected graph by default', () => {
    const graph = createGraph('Test Graph')

    expect(graph.directed).toBe(false)
  })
})

describe('createNode', () => {
  it('should create node with correct properties', () => {
    const node = createNode('node1', 'Test Node', 5)

    expect(node).toHaveProperty('id')
    expect(node).toHaveProperty('label')
    expect(node).toHaveProperty('weight')
    expect(node).toHaveProperty('data')
    expect(node.id).toBe('node1')
    expect(node.label).toBe('Test Node')
    expect(node.weight).toBe(5)
  })

  it('should create node without weight', () => {
    const node = createNode('node1', 'Test Node')

    expect(node.weight).toBeUndefined()
  })
})

describe('createEdge', () => {
  it('should create edge with correct properties', () => {
    const edge = createEdge('edge1', 'node1', 'node2', 5, true)

    expect(edge).toHaveProperty('id')
    expect(edge).toHaveProperty('source')
    expect(edge).toHaveProperty('target')
    expect(edge).toHaveProperty('weight')
    expect(edge).toHaveProperty('directed')
    expect(edge).toHaveProperty('data')
    expect(edge.id).toBe('edge1')
    expect(edge.source).toBe('node1')
    expect(edge.target).toBe('node2')
    expect(edge.weight).toBe(5)
    expect(edge.directed).toBe(true)
  })

  it('should create undirected edge by default', () => {
    const edge = createEdge('edge1', 'node1', 'node2')

    expect(edge.directed).toBeUndefined()
  })

  it('should create edge without weight', () => {
    const edge = createEdge('edge1', 'node1', 'node2')

    expect(edge.weight).toBeUndefined()
  })
})