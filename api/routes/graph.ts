import express from 'express'

const router = express.Router()

interface Node {
  id: string
  name: string
  type: 'protein' | 'gene' | 'metabolite' | 'pathway'
  degree: number
  betweenness: number
  closeness: number
  eigenvector: number
  community: number
}

interface Edge {
  id: string
  source: string
  target: string
  type: 'citation' | 'reference' | 'collaboration'
  weight: number
}

router.get('/', (req, res) => {
  res.json({
    status: 'Graph API is working',
    endpoints: ['/nodes', '/edges', '/statistics', '/centrality/:type'],
    message: 'Use /nodes for graph nodes, /edges for graph edges, /statistics for graph statistics, /centrality/:type for centrality metrics'
  })
})

router.get('/nodes', (req, res) => {
  const nodes: Node[] = [
    { id: 'n1', name: 'P53', type: 'protein', degree: 45, betweenness: 0.234, closeness: 0.567, eigenvector: 0.789, community: 1 },
    { id: 'n2', name: 'MDM2', type: 'protein', degree: 38, betweenness: 0.189, closeness: 0.523, eigenvector: 0.654, community: 1 },
    { id: 'n3', name: 'AKT1', type: 'protein', degree: 32, betweenness: 0.145, closeness: 0.489, eigenvector: 0.567, community: 2 },
    { id: 'n4', name: 'EGFR', type: 'protein', degree: 28, betweenness: 0.123, closeness: 0.456, eigenvector: 0.489, community: 2 },
    { id: 'n5', name: 'PTEN', type: 'protein', degree: 25, betweenness: 0.098, closeness: 0.423, eigenvector: 0.412, community: 2 },
    { id: 'n6', name: 'TP53', type: 'gene', degree: 52, betweenness: 0.267, closeness: 0.589, eigenvector: 0.823, community: 1 },
    { id: 'n7', name: 'ATP', type: 'metabolite', degree: 67, betweenness: 0.312, closeness: 0.623, eigenvector: 0.901, community: 3 },
    { id: 'n8', name: 'Glucose', type: 'metabolite', degree: 45, betweenness: 0.201, closeness: 0.534, eigenvector: 0.678, community: 3 },
    { id: 'n9', name: 'AKT pathway', type: 'pathway', degree: 15, betweenness: 0.067, closeness: 0.345, eigenvector: 0.234, community: 2 },
    { id: 'n10', name: 'BAX', type: 'protein', degree: 18, betweenness: 0.089, closeness: 0.378, eigenvector: 0.289, community: 1 }
  ]
  res.json(nodes)
})

router.get('/edges', (req, res) => {
  const edges: Edge[] = [
    { id: 'e1', source: 'a1', target: 'a2', type: 'citation', weight: 0.85 },
    { id: 'e2', source: 'a1', target: 'a4', type: 'collaboration', weight: 0.72 },
    { id: 'e3', source: 'a3', target: 'a4', type: 'reference', weight: 0.68 },
    { id: 'e4', source: 'a2', target: 'a5', type: 'citation', weight: 0.91 },
    { id: 'e5', source: 'a6', target: 'a7', type: 'collaboration', weight: 0.63 },
    { id: 'e6', source: 'a7', target: 'a8', type: 'reference', weight: 0.57 },
    { id: 'e7', source: 'a3', target: 'a8', type: 'citation', weight: 0.74 },
    { id: 'e8', source: 'a1', target: 'a8', type: 'reference', weight: 0.81 }
  ]
  res.json(edges)
})

router.get('/statistics', (req, res) => {
  const stats = {
    totalNodes: 2513,
    totalEdges: 4582,
    averageDegree: 3.64,
    networkDensity: 0.0015,
    averageClustering: 0.234,
    diameter: 12,
    averagePathLength: 4.23,
    communities: 8,
    modularity: 0.67
  }
  res.json(stats)
})

router.get('/centrality/:type', (req, res) => {
  const { type } = req.params
  const centralityData = {
    degree: [
      { id: 'n7', name: 'ATP', value: 67, rank: 1 },
      { id: 'n6', name: 'TP53', value: 52, rank: 2 },
      { id: 'n1', name: 'P53', value: 45, rank: 3 },
      { id: 'n8', name: 'Glucose', value: 45, rank: 4 },
      { id: 'n2', name: 'MDM2', value: 38, rank: 5 }
    ],
    betweenness: [
      { id: 'n7', name: 'ATP', value: 0.312, rank: 1 },
      { id: 'n6', name: 'TP53', value: 0.267, rank: 2 },
      { id: 'n1', name: 'P53', value: 0.234, rank: 3 },
      { id: 'n2', name: 'MDM2', value: 0.189, rank: 4 },
      { id: 'n3', name: 'AKT1', value: 0.145, rank: 5 }
    ],
    closeness: [
      { id: 'n7', name: 'ATP', value: 0.623, rank: 1 },
      { id: 'n6', name: 'TP53', value: 0.589, rank: 2 },
      { id: 'n1', name: 'P53', value: 0.567, rank: 3 },
      { id: 'n2', name: 'MDM2', value: 0.523, rank: 4 },
      { id: 'n3', name: 'AKT1', value: 0.489, rank: 5 }
    ],
    eigenvector: [
      { id: 'n7', name: 'ATP', value: 0.901, rank: 1 },
      { id: 'n6', name: 'TP53', value: 0.823, rank: 2 },
      { id: 'n1', name: 'P53', value: 0.789, rank: 3 },
      { id: 'n2', name: 'MDM2', value: 0.654, rank: 4 },
      { id: 'n3', name: 'AKT1', value: 0.567, rank: 5 }
    ]
  }
  
  if (!centralityData[type as keyof typeof centralityData]) {
    return res.status(400).json({ error: 'Invalid centrality type' })
  }
  
  res.json(centralityData[type as keyof typeof centralityData])
})

export default router
