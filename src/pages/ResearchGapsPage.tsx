import { useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'

interface ResearchGap {
  id: string;
  area: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  supportingEvidence: number;
  recommendation: string;
  createdAt: string;
}

export default function ResearchGapsPage() {
  const [gaps, setGaps] = useState<ResearchGap[]>([
    {
      id: '1',
      area: 'Механизм связи P53 с метаболизмом в раке',
      priority: 'high',
      confidence: 0.78,
      supportingEvidence: 12,
      recommendation: 'Провести мета-анализ существующих исследований по метаболической репрограммированию опухолей с участием P53. Исследовать роль P53 в регуляции ключевых метаболических путей (glycolysis, TCA cycle, fatty acid oxidation) и выявить потенциальные точки терапевтического вмешательства.',
      createdAt: '2024-12-15'
    },
    {
      id: '2',
      area: 'Перекрестные механизмы резистентности между MAPK и PI3K путями',
      priority: 'critical',
      confidence: 0.85,
      supportingEvidence: 23,
      recommendation: 'Исследовать компенсаторные механизмы активации PI3K при ингибировании MAPK пути. Идентифицировать общие downstream мишени и оценить синергетические эффекты комбинационной терапии.',
      createdAt: '2024-12-15'
    },
    {
      id: '3',
      area: 'Роль некодирующей РНК в регуляции апоптоза опухолей',
      priority: 'medium',
      confidence: 0.62,
      supportingEvidence: 8,
      recommendation: 'Провести систематический анализ miRNA и lncRNA, нацеленных на апоптоз. Выявить miRNAs, которые одновременно регулируют несколько про- и анти-апоптотических генов. Разработать модель интегральной регуляции.',
      createdAt: '2024-12-15'
    },
    {
      id: '4',
      area: 'Молекулярные механизмы иммунной эволюции опухолей',
      priority: 'high',
      confidence: 0.71,
      supportingEvidence: 15,
      recommendation: 'Исследовать динамику изменения экспрессии иммунных чекпоинтов (PD-1, PD-L1, CTLA-4) под действием различных терапевтических агентов. Оценить возможность сочетания иммунотерапии с таргетной терапией для усиления иммунного ответа.',
      createdAt: '2024-12-15'
    },
  ])

  const [filter, setFilter] = useState<'all' | 'high' | 'critical'>('all')
  const [sort, setSort] = useState<'priority' | 'confidence' | 'evidence'>('priority')
  const [selectedGap, setSelectedGap] = useState<ResearchGap | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический',
  }

  const filteredGaps = gaps.filter(gap => {
    if (filter === 'high') return gap.priority === 'high' || gap.priority === 'critical'
    if (filter === 'critical') return gap.priority === 'critical'
    return true
  })

  const sortedGaps = [...filteredGaps].sort((a, b) => {
    if (sort === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    if (sort === 'confidence') return b.confidence - a.confidence
    if (sort === 'evidence') return b.supportingEvidence - a.supportingEvidence
    return 0
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Research Gaps - Пробелы в исследованиях
        </h1>
        
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Все приоритеты</option>
            <option value="high">Высокий и выше</option>
            <option value="critical">Только критические</option>
          </select>
          
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="priority">По приоритету</option>
            <option value="confidence">По уверенности</option>
            <option value="evidence">По доказательствам</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedGaps.map(gap => (
          <div key={gap.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[gap.priority]}`}>
                {priorityLabels[gap.priority]}
              </span>
              <span className="text-sm text-gray-500">{gap.createdAt}</span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {gap.area}
            </h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Уверенность:</span>
                <span className="font-semibold text-gray-900">
                  {(gap.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Доказательства:</span>
                <span className="font-semibold text-gray-900">
                  {gap.supportingEvidence} статей
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Рекомендация:
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {gap.recommendation}
              </p>
            </div>

            <div className="flex space-x-2 mt-4">
              <button 
                onClick={() => {
                  setSelectedGap(gap)
                  setShowDetailsModal(true)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                📖 Подробнее
              </button>
              <button 
                onClick={() => {
                  try {
                    const blob = new Blob([JSON.stringify(gaps.filter(g => g.priority !== 'low'), null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `research-gaps-${new Date().toISOString().slice(0, 10)}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    toast.success('Пробелы успешно экспортированы')
                  } catch (error) {
                    console.error('Export error:', error)
                    toast.error('Не удалось экспортировать пробелы')
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                📥 Экспорт
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-md">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Подсказка</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Используйте фильтры для поиска наиболее важных пробелов</li>
          <li>Сортировка поможет приоритизировать направления исследований</li>
          <li>Критические пробелы требуют немедленного внимания</li>
          <li>Рекомендации включают конкретные экспериментальные подходы</li>
        </ul>
      </div>

      {showDetailsModal && selectedGap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedGap.area}
              </h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm text-gray-600">Приоритет:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedGap.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  selectedGap.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  selectedGap.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedGap.priority === 'critical' ? '🔴 Критический' :
                   selectedGap.priority === 'high' ? '🟠 Высокий' :
                   selectedGap.priority === 'medium' ? '🔵 Средний' : '⚪ Низкий'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Уверенность:</span>
                <span className="ml-2 font-semibold text-gray-900">{(selectedGap.confidence * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Подтверждающие доказательства:</span>
                <span className="ml-2 font-semibold text-gray-900">{selectedGap.supportingEvidence}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Дата создания:</span>
                <span className="ml-2 font-semibold text-gray-900">{selectedGap.createdAt}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-2">Рекомендация:</span>
                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">
                  {selectedGap.recommendation}
                </p>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t space-x-3">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Закрыть
              </button>
              <button 
                onClick={() => {
                  try {
                    const blob = new Blob([JSON.stringify(selectedGap, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `gap-${selectedGap.id}-${new Date().toISOString().slice(0, 10)}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    toast.success('Детали пробела экспортированы')
                    setShowDetailsModal(false)
                  } catch (error) {
                    console.error('Export error:', error)
                    toast.error('Не удалось экспортировать пробел')
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📥 Экспортировать пробел
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
