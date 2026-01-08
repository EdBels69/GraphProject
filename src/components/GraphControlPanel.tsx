import { useState } from 'react'
import { Graph, GraphStatistics, CentralityResult, PathResult, ConnectivityResult } from '@/shared/types'

interface GraphControlPanelProps {
  graph: Graph
  onAlgorithmSelect: (algorithm: string) => void
  onCalculate: () => void
  loading?: boolean
}

type AlgorithmType =
  | 'shortest-path'
  | 'centrality'
  | 'connectivity'
  | 'statistics'
  | 'validate'

export default function GraphControlPanel({
  graph,
  onAlgorithmSelect,
  onCalculate,
  loading = false
}: GraphControlPanelProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType | null>(null)
  const [sourceNode, setSourceNode] = useState<string>('')
  const [targetNode, setTargetNode] = useState<string>('')

  const algorithms = [
    {
      id: 'shortest-path',
      name: 'Кратчайший путь',
      description: 'Находит кратчайший путь между двумя узлами',
      icon: '🔍',
      requiresSource: true,
      requiresTarget: true
    },
    {
      id: 'centrality',
      name: 'Центральность',
      description: 'Рассчитывает показатели центральности узлов',
      icon: '🎯',
      requiresSource: false,
      requiresTarget: false
    },
    {
      id: 'connectivity',
      name: 'Связность',
      description: 'Проверяет связность графа и находит компоненты',
      icon: '🔗',
      requiresSource: false,
      requiresTarget: false
    },
    {
      id: 'statistics',
      name: 'Статистика',
      description: 'Расчитывает основные характеристики графа',
      icon: '📊',
      requiresSource: false,
      requiresTarget: false
    },
    {
      id: 'validate',
      name: 'Валидация',
      description: 'Проверяет целостность графа',
      icon: '✅',
      requiresSource: false,
      requiresTarget: false
    }
  ]

  const handleAlgorithmSelect = (algorithmId: AlgorithmType) => {
    setSelectedAlgorithm(algorithmId)
    onAlgorithmSelect(algorithmId)
  }

  const canCalculate = () => {
    if (selectedAlgorithm === 'shortest-path') {
      return sourceNode && targetNode
    }
    return selectedAlgorithm !== null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Панель управления графами
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Выберите алгоритм анализа
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {algorithms.map(algo => {
              const isSelected = selectedAlgorithm === algo.id

              return (
                <button
                  key={algo.id}
                  onClick={() => handleAlgorithmSelect(algo.id as AlgorithmType)}
                  disabled={loading}
                  className={`p-4 rounded-lg border-2 transition-all ${isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{algo.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {algo.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {algo.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedAlgorithm === 'shortest-path' && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Исходный узел
              </label>
              <select
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">-- Выберите узел --</option>
                {graph.nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.label} ({node.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Целевой узел
              </label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">-- Выберите узел --</option>
                {graph.nodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.label} ({node.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          onClick={onCalculate}
          disabled={!canCalculate() || loading}
          className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8 8 0 018 8 0 018 8 0 018zm-2 0a2 2 0 012-2 2 0 012 2 0 012 2 0 012-2-2 2 0 01-2-2 2 0 012zm2-2 2 0 01-2-2 2 0 012z"
                />
              </svg>
              Выполнить...
            </span>
          ) : (
            'Выполнить анализ'
          )}
        </button>

        {graph.nodes.length === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
            <div className="flex">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Граф пуст
                </h4>
                <p className="text-sm text-yellow-800">
                  Добавьте узлы и связи для начала анализа
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}