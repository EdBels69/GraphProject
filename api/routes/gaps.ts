import express from 'express'

const router = express.Router()

interface ResearchGap {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  relatedEntities: string[]
  evidenceScore: number
  suggestedExperiments: string[]
  publications: number
}

router.get('/', (req, res) => {
  const { priority, category, sortBy } = req.query
  
  const gaps: ResearchGap[] = [
    {
      id: 'g1',
      title: 'Механизм регуляции MDM2 в гипоксии',
      description: 'Отсутствуют данные о том, как гипоксия влияет на взаимодействие P53-MDM2 и его деградацию. Необходимо исследование гипоксического регулирования пути MDM2.',
      priority: 'high',
      category: 'Взаимодействия белков',
      relatedEntities: ['P53', 'MDM2', 'HIF-1α'],
      evidenceScore: 0.85,
      suggestedExperiments: [
        'Исследование деградации MDM2 в условиях гипоксии (1% O2)',
        'Анализ фосфорилирования MDM2 при гипоксии',
        'Оценка влияния HIF-1α на транскрипцию MDM2'
      ],
      publications: 12
    },
    {
      id: 'g2',
      title: 'Роль метаболитов в активации AKT пути',
      description: 'Неизвестно, какие метаболиты модулируют фосфорилирование AKT1 и PTEN. Требуется исследование метаболической регуляции этого пути.',
      priority: 'high',
      category: 'Метаболическая регуляция',
      relatedEntities: ['AKT1', 'PTEN', 'ATP', 'Glucose'],
      evidenceScore: 0.78,
      suggestedExperiments: [
        'Метаболомический анализ при активации AKT',
        'Исследование влияния АТФ/АДФ соотношения на AKT фосфорилирование',
        'Протеинфосфорилазный анализ PTEN при изменении метаболизма'
      ],
      publications: 8
    },
    {
      id: 'g3',
      title: 'Скрытые взаимодействия в PI3K/AKT/mTOR пути',
      description: 'Анализ графа выявил потенциальные непрямые взаимодействия между компонентами PI3K/AKT/mTOR пути, которые не описаны в литературе.',
      priority: 'medium',
      category: 'Скрытые паттерны',
      relatedEntities: ['PI3K', 'AKT1', 'mTOR', 'PTEN'],
      evidenceScore: 0.72,
      suggestedExperiments: [
        'Коиммунопреципитация для выявления непрямых взаимодействий',
        'Анализ временнόй динамики активации',
        'Ингибиторный анализ компонентов пути'
      ],
      publications: 15
    },
    {
      id: 'g4',
      title: 'Влияние посттрансляционных модификаций на P53',
      description: 'Недостаточно данных о комбинированном влиянии ацетилирования, фосфорилирования и убиквитинирования на стабильность P53.',
      priority: 'high',
      category: 'Посттрансляционные модификации',
      relatedEntities: ['P53', 'MDM2', 'BAX', 'ATM'],
      evidenceScore: 0.81,
      suggestedExperiments: [
        'Масс-спектрометрический анализ модификаций P53',
        'Исследование кластеризации модификаций',
        'Анализ влияния на транскрипционную активность'
      ],
      publications: 22
    },
    {
      id: 'g5',
      title: 'Метаболические переключения при стрессе',
      description: 'Неизвестно, как метаболические переключения между гликолизом и окислительным фосфорилированием влияют на клеточный ответ на стресс.',
      priority: 'medium',
      category: 'Метаболизм',
      relatedEntities: ['Glucose', 'Lactate', 'ATP', 'HIF-1α'],
      evidenceScore: 0.69,
      suggestedExperiments: [
        'Метаболомический анализ при различных типах стресса',
        'Измерение скорости гликолиза и дыхания',
        'Анализ экспрессии метаболических ферментов'
      ],
      publications: 18
    },
    {
      id: 'g6',
      title: 'Кросс-ток между клеточным циклом и апоптозом',
      description: 'Недостаточно данных о том, как клеточный цикл модулирует апоптотические пути, особенно в контексте P53.',
      priority: 'medium',
      category: 'Клеточный цикл',
      relatedEntities: ['P53', 'BAX', 'Cyclin D1', 'CDK4/6'],
      evidenceScore: 0.75,
      suggestedExperiments: [
        'Синхронизация клеток и анализ апоптоза',
        'Ингибиторный анализ CDK',
        'Протеомический анализ клеточного цикла'
      ],
      publications: 25
    },
    {
      id: 'g7',
      title: 'Новые метаболические взаимодействия с EGFR',
      description: 'Анализ выявил потенциальные метаболические связи между EGFR сигнализацией и метаболизмом, которые требуют экспериментальной проверки.',
      priority: 'low',
      category: 'Скрытые паттерны',
      relatedEntities: ['EGFR', 'AKT1', 'Glucose', 'Lactate'],
      evidenceScore: 0.62,
      suggestedExperiments: [
        'Метаболомический анализ при активации EGFR',
        'Исследование влияния EGFR на транспорт глюкозы',
        'Анализ метаболических фенотипов при ингибировании EGFR'
      ],
      publications: 9
    },
    {
      id: 'g8',
      title: 'Темпоральные паттерны активации белков',
      description: 'Отсутствуют данные о временных паттернах активации ключевых белков после стимуляции, что критично для понимания динамики.',
      priority: 'high',
      category: 'Динамика',
      relatedEntities: ['P53', 'MDM2', 'AKT1', 'EGFR'],
      evidenceScore: 0.88,
      suggestedExperiments: [
        'Временнοй курс активации (0-24 часа)',
        'Высокочувствительное протеомное исследование',
        'Моделирование кинетики активации'
      ],
      publications: 6
    }
  ]

  let filteredGaps = gaps

  if (priority) {
    filteredGaps = filteredGaps.filter(gap => gap.priority === priority)
  }

  if (category) {
    filteredGaps = filteredGaps.filter(gap => gap.category === category)
  }

  if (sortBy === 'priority') {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    filteredGaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  } else if (sortBy === 'evidence') {
    filteredGaps.sort((a, b) => b.evidenceScore - a.evidenceScore)
  } else if (sortBy === 'publications') {
    filteredGaps.sort((a, b) => b.publications - a.publications)
  }

  res.json(filteredGaps)
})

router.get('/:id', (req, res) => {
  const gaps: ResearchGap[] = [
    {
      id: 'g1',
      title: 'Механизм регуляции MDM2 в гипоксии',
      description: 'Отсутствуют данные о том, как гипоксия влияет на взаимодействие P53-MDM2 и его деградацию. Необходимо исследование гипоксического регулирования пути MDM2.',
      priority: 'high',
      category: 'Взаимодействия белков',
      relatedEntities: ['P53', 'MDM2', 'HIF-1α'],
      evidenceScore: 0.85,
      suggestedExperiments: [
        'Исследование деградации MDM2 в условиях гипоксии (1% O2)',
        'Анализ фосфорилирования MDM2 при гипоксии',
        'Оценка влияния HIF-1α на транскрипцию MDM2'
      ],
      publications: 12
    }
  ]

  const gap = gaps.find(g => g.id === req.params.id)
  if (!gap) {
    return res.status(404).json({ error: 'Research gap not found' })
  }
  res.json(gap)
})

router.get('/categories/list', (req, res) => {
  const categories = [
    'Взаимодействия белков',
    'Метаболическая регуляция',
    'Скрытые паттерны',
    'Посттрансляционные модификации',
    'Метаболизм',
    'Клеточный цикл',
    'Динамика'
  ]
  res.json(categories)
})

export default router
