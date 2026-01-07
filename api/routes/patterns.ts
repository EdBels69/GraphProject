import express from 'express'

const router = express.Router()

interface Pattern {
  id: string
  name: string
  description: string
  nodes: string[]
  type: 'cluster' | 'trend' | 'gap'
}

const patterns: Pattern[] = [
  {
    id: 'p1',
    name: 'P53-MDM2 Interaction Cluster',
    description: 'Strong interaction pattern between P53 and MDM2 proteins in cancer research',
    nodes: ['a1', 'a2', 'a8'],
    type: 'cluster'
  },
  {
    id: 'p2',
    name: 'AKT Pathway Trend',
    description: 'Emerging trend in AKT pathway research across multiple articles',
    nodes: ['a3', 'a5', 'a4'],
    type: 'trend'
  },
  {
    id: 'p3',
    name: 'Metabolism Research Gap',
    description: 'Identified gap in ATP and Glucose metabolism interaction studies',
    nodes: ['a6', 'a7'],
    type: 'gap'
  },
  {
    id: 'p4',
    name: 'EGFR Inhibition Pattern',
    description: 'Consistent pattern of EGFR inhibition studies',
    nodes: ['a4', 'a3'],
    type: 'cluster'
  },
  {
    id: 'p5',
    name: 'Apoptosis Pathway Trend',
    description: 'Growing trend in BAX-mediated apoptosis research',
    nodes: ['a1', 'a8', 'a5'],
    type: 'trend'
  }
]

router.get('/', (req, res) => {
  res.json(patterns)
})

router.get('/list', (req, res) => {
  res.json(patterns)
})

router.get('/:id', (req, res) => {
  const pattern = patterns.find(p => p.id === req.params.id)
  if (!pattern) {
    return res.status(404).json({ error: 'Pattern not found' })
  }
  res.json(pattern)
})

router.post('/', (req, res) => {
  const { name, description, nodes, type } = req.body
  
  if (!name || !description || !nodes || !type) {
    return res.status(400).json({ 
      error: 'Missing required fields: name, description, nodes, type' 
    })
  }
  
  const newPattern: Pattern = {
    id: `p${Date.now()}`,
    name,
    description,
    nodes,
    type
  }
  
  patterns.push(newPattern)
  res.status(201).json(newPattern)
})

export default router
