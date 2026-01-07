import express from 'express'

const router = express.Router()

interface AnalysisProgress {
  stage: string
  progress: number
  message: string
}

const mockAnalysisData = {
  totalArticles: 47,
  processedArticles: 32,
  totalEntities: 2513,
  totalInteractions: 4582,
  totalLinks: 892,
  status: 'in_progress' as 'in_progress' | 'completed',
  stages: [
    { id: 'extraction', name: 'Извлечение ссылок', status: 'completed', progress: 100 },
    { id: 'entities', name: 'Извлечение сущностей', status: 'completed', progress: 100 },
    { id: 'interactions', name: 'Поиск взаимодействий', status: 'in_progress', progress: 68 },
    { id: 'graph', name: 'Построение графа', status: 'pending', progress: 0 },
    { id: 'gaps', name: 'Поиск исследовательских пробелов', status: 'pending', progress: 0 },
    { id: 'statistics', name: 'Расчет статистики', status: 'pending', progress: 0 }
  ]
}

router.get('/', (req, res) => {
  res.json({
    status: 'Analysis API is working',
    endpoints: ['/progress', '/entities', '/interactions'],
    message: 'Use /progress for analysis progress, /entities for entities data, /interactions for interactions data'
  })
})

router.get('/progress', (req, res) => {
  setTimeout(() => {
    res.json(mockAnalysisData)
  }, 500)
})

router.post('/start', (req, res) => {
  res.json({ 
    message: 'Analysis started',
    analysisId: 'analysis-' + Date.now()
  })
})

router.get('/entities', (req, res) => {
  const entities = {
    proteins: [
      { id: 'p1', name: 'P53', count: 45, articles: [1, 2, 3, 4, 5] },
      { id: 'p2', name: 'MDM2', count: 38, articles: [1, 2, 3, 4] },
      { id: 'p3', name: 'AKT1', count: 32, articles: [2, 3, 5, 6] },
      { id: 'p4', name: 'EGFR', count: 28, articles: [1, 4, 7, 8] },
      { id: 'p5', name: 'PTEN', count: 25, articles: [3, 5, 6, 9] }
    ],
    genes: [
      { id: 'g1', name: 'TP53', count: 52, articles: [1, 2, 3, 4, 5, 6] },
      { id: 'g2', name: 'AKT1', count: 35, articles: [2, 3, 5, 6] },
      { id: 'g3', name: 'EGFR', count: 30, articles: [1, 4, 7, 8] },
      { id: 'g4', name: 'PTEN', count: 28, articles: [3, 5, 6, 9] },
      { id: 'g5', name: 'MDM2', count: 42, articles: [1, 2, 3, 4] }
    ],
    metabolites: [
      { id: 'm1', name: 'ATP', count: 67, articles: [1, 2, 3, 4, 5, 6, 7] },
      { id: 'm2', name: 'ADP', count: 58, articles: [2, 3, 4, 5, 6, 7] },
      { id: 'm3', name: 'Glucose', count: 45, articles: [1, 3, 5, 7, 9] },
      { id: 'm4', name: 'Lactate', count: 38, articles: [2, 4, 6, 8] },
      { id: 'm5', name: 'Pyruvate', count: 32, articles: [3, 5, 7, 9] }
    ]
  }
  res.json(entities)
})

router.get('/interactions', (req, res) => {
  const interactions = [
    { id: 'i1', source: 'P53', target: 'MDM2', type: 'inhibition', weight: 6, articles: [1, 2, 3, 4, 5, 6] },
    { id: 'i2', source: 'AKT1', target: 'PTEN', type: 'phosphorylation', weight: 5, articles: [2, 3, 5, 6, 7] },
    { id: 'i3', source: 'EGFR', target: 'AKT1', type: 'activation', weight: 4, articles: [1, 4, 7, 8] },
    { id: 'i4', source: 'P53', target: 'BAX', type: 'activation', weight: 4, articles: [1, 2, 5, 9] },
    { id: 'i5', source: 'MDM2', target: 'PTEN', type: 'inhibition', weight: 3, articles: [3, 4, 6] }
  ]
  res.json(interactions)
})

export default router
