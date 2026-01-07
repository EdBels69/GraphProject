import express from 'express'

const router = express.Router()

router.get('/overview', (req, res) => {
  const overview = {
    totalArticles: 47,
    processedArticles: 32,
    pendingArticles: 15,
    totalEntities: 2513,
    proteins: 456,
    genes: 387,
    metabolites: 1205,
    pathways: 89,
    complexes: 376,
    totalInteractions: 4582,
    activations: 1834,
    inhibitions: 1456,
    phosphorylations: 892,
    bindings: 400,
    totalLinks: 892,
    webLinks: 567,
    literatureLinks: 325,
    researchGaps: 8,
    highPriority: 3,
    mediumPriority: 3,
    lowPriority: 2
  }
  res.json(overview)
})

router.get('/entities/distribution', (req, res) => {
  const distribution = [
    { type: 'Протеины', count: 456, percentage: 18.1 },
    { type: 'Гены', count: 387, percentage: 15.4 },
    { type: 'Метаболиты', count: 1205, percentage: 48.0 },
    { type: 'Пути', count: 89, percentage: 3.5 },
    { type: 'Комплексы', count: 376, percentage: 15.0 }
  ]
  res.json(distribution)
})

router.get('/interactions/distribution', (req, res) => {
  const distribution = [
    { type: 'Активация', count: 1834, percentage: 40.0 },
    { type: 'Ингибирование', count: 1456, percentage: 31.8 },
    { type: 'Фосфорилирование', count: 892, percentage: 19.5 },
    { type: 'Связывание', count: 400, percentage: 8.7 }
  ]
  res.json(distribution)
})

router.get('/articles/timeline', (req, res) => {
  const timeline = [
    { year: 2018, count: 5 },
    { year: 2019, count: 8 },
    { year: 2020, count: 12 },
    { year: 2021, count: 15 },
    { year: 2022, count: 18 },
    { year: 2023, count: 22 },
    { year: 2024, count: 25 }
  ]
  res.json(timeline)
})

router.get('/top/entities', (req, res) => {
  const topEntities = {
    proteins: [
      { name: 'P53', count: 45, articles: 12, interactions: 38 },
      { name: 'MDM2', count: 38, articles: 10, interactions: 32 },
      { name: 'AKT1', count: 32, articles: 9, interactions: 28 },
      { name: 'EGFR', count: 28, articles: 8, interactions: 24 },
      { name: 'PTEN', count: 25, articles: 7, interactions: 22 }
    ],
    genes: [
      { name: 'TP53', count: 52, articles: 14, interactions: 42 },
      { name: 'AKT1', count: 35, articles: 10, interactions: 30 },
      { name: 'EGFR', count: 30, articles: 9, interactions: 26 },
      { name: 'PTEN', count: 28, articles: 8, interactions: 24 },
      { name: 'MDM2', count: 42, articles: 11, interactions: 36 }
    ],
    metabolites: [
      { name: 'ATP', count: 67, articles: 18, interactions: 52 },
      { name: 'ADP', count: 58, articles: 16, interactions: 46 },
      { name: 'Glucose', count: 45, articles: 12, interactions: 38 },
      { name: 'Lactate', count: 38, articles: 10, interactions: 32 },
      { name: 'Pyruvate', count: 32, articles: 9, interactions: 28 }
    ]
  }
  res.json(topEntities)
})

router.get('/graph/metrics', (req, res) => {
  const metrics = {
    nodes: 2513,
    edges: 4582,
    averageDegree: 3.64,
    networkDensity: 0.0015,
    averageClustering: 0.234,
    diameter: 12,
    averagePathLength: 4.23,
    modularity: 0.67,
    communities: 8,
    centrality: {
      degree: {
        top: [
          { name: 'ATP', value: 67 },
          { name: 'TP53', value: 52 },
          { name: 'P53', value: 45 },
          { name: 'ADP', value: 58 },
          { name: 'MDM2', value: 42 }
        ],
        average: 3.64,
        stdDev: 2.15
      },
      betweenness: {
        top: [
          { name: 'ATP', value: 0.312 },
          { name: 'TP53', value: 0.267 },
          { name: 'P53', value: 0.234 },
          { name: 'MDM2', value: 0.189 },
          { name: 'AKT1', value: 0.145 }
        ],
        average: 0.089,
        stdDev: 0.067
      },
      closeness: {
        top: [
          { name: 'ATP', value: 0.623 },
          { name: 'TP53', value: 0.589 },
          { name: 'P53', value: 0.567 },
          { name: 'MDM2', value: 0.523 },
          { name: 'AKT1', value: 0.489 }
        ],
        average: 0.312,
        stdDev: 0.145
      },
      eigenvector: {
        top: [
          { name: 'ATP', value: 0.901 },
          { name: 'TP53', value: 0.823 },
          { name: 'P53', value: 0.789 },
          { name: 'MDM2', value: 0.654 },
          { name: 'AKT1', value: 0.567 }
        ],
        average: 0.234,
        stdDev: 0.189
      }
    }
  }
  res.json(metrics)
})

router.get('/gaps/summary', (req, res) => {
  const summary = {
    total: 8,
    byPriority: {
      high: 3,
      medium: 3,
      low: 2
    },
    byCategory: {
      'Взаимодействия белков': 1,
      'Метаболическая регуляция': 1,
      'Скрытые паттерны': 2,
      'Посттрансляционные модификации': 1,
      'Метаболизм': 1,
      'Клеточный цикл': 1,
      'Динамика': 1
    },
    averageEvidenceScore: 0.76,
    totalPublications: 115,
    avgPublicationsPerGap: 14.4
  }
  res.json(summary)
})

router.get('/quality/metrics', (req, res) => {
  const metrics = {
    dataCompleteness: 0.92,
    entityAccuracy: 0.88,
    interactionConfidence: 0.85,
    linkValidation: 0.78,
    extractionConsistency: 0.91,
    overallScore: 0.87
  }
  res.json(metrics)
})

export default router
