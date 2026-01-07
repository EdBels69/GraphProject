import express from 'express'

const router = express.Router()

router.post('/generate', (req, res) => {
  const { format, dataType, includeMetadata } = req.body
  
  const mockData = {
    metadata: includeMetadata ? {
      exportDate: new Date().toISOString(),
      analysisVersion: '1.0.0',
      modelVersion: 'MiMo V2 Flash',
      totalArticles: 47,
      totalEntities: 2513,
      totalInteractions: 4582,
      totalLinks: 892
    } : null,
    articles: [
      {
        id: 'art1',
        title: 'P53-MDM2 interaction dynamics in cancer',
        authors: ['Smith J', 'Johnson A'],
        year: 2023,
        journal: 'Nature Communications',
        doi: '10.1038/s41467-023-00001',
        entities: ['P53', 'MDM2'],
        interactions: ['i1']
      }
    ],
    entities: {
      proteins: [
        { id: 'p1', name: 'P53', count: 45, articles: [1, 2, 3, 4, 5] },
        { id: 'p2', name: 'MDM2', count: 38, articles: [1, 2, 3, 4] }
      ],
      genes: [
        { id: 'g1', name: 'TP53', count: 52, articles: [1, 2, 3, 4, 5, 6] }
      ],
      metabolites: [
        { id: 'm1', name: 'ATP', count: 67, articles: [1, 2, 3, 4, 5, 6, 7] }
      ]
    },
    interactions: [
      { id: 'i1', source: 'P53', target: 'MDM2', type: 'inhibition', weight: 6 }
    ],
    graph: {
      nodes: [
        { id: 'n1', name: 'P53', type: 'protein', degree: 45, community: 1 },
        { id: 'n2', name: 'MDM2', type: 'protein', degree: 38, community: 1 }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', type: 'inhibition', weight: 6 }
      ]
    },
    statistics: {
      totalArticles: 47,
      totalEntities: 2513,
      totalInteractions: 4582,
      averageDegree: 3.64,
      networkDensity: 0.0015
    },
    gaps: [
      {
        id: 'g1',
        title: 'Механизм регуляции MDM2 в гипоксии',
        priority: 'high',
        evidenceScore: 0.85
      }
    ]
  }

  if (dataType === 'all') {
    res.json(mockData)
  } else if (dataType === 'entities') {
    res.json(mockData.entities)
  } else if (dataType === 'interactions') {
    res.json(mockData.interactions)
  } else if (dataType === 'graph') {
    res.json(mockData.graph)
  } else if (dataType === 'statistics') {
    res.json(mockData.statistics)
  } else {
    res.status(400).json({ error: 'Invalid data type' })
  }
})

router.get('/formats', (req, res) => {
  const formats = [
    { value: 'json', label: 'JSON', description: 'Универсальный формат для программной обработки' },
    { value: 'csv', label: 'CSV', description: 'Табличный формат для Excel/Google Sheets' },
    { value: 'xlsx', label: 'XLSX', description: 'Формат Excel с поддержкой формул' },
    { value: 'gexf', label: 'GEXF', description: 'Формат для Gephi/Cytoscape' }
  ]
  res.json(formats)
})

router.get('/data-types', (req, res) => {
  const dataTypes = [
    { value: 'all', label: 'Все данные', description: 'Полный экспорт всех анализируемых данных' },
    { value: 'entities', label: 'Сущности', description: 'Только извлеченные белки, гены, метаболиты' },
    { value: 'interactions', label: 'Взаимодействия', description: 'Только выявленные взаимодействия' },
    { value: 'graph', label: 'Графовые данные', description: 'Структура графа для визуализации' },
    { value: 'statistics', label: 'Статистика', description: 'Сводная статистика и метрики' }
  ]
  res.json(dataTypes)
})

export default router
