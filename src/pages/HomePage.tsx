import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useApi } from '@/hooks/useApi'
import { FileUploader } from '@/components/FileUploader'
import { parseFile, buildGraphFromParsedData } from '@/utils/fileParser'

interface ArticleNode {
  id: string;
  title: string;
  year: number;
  citations: number;
  category: string;
  author: string;
  abstract: string;
  keywords: string[];
}

interface ArticleEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
  type: 'citation' | 'reference' | 'collaboration';
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  nodes: string[];
  type: 'cluster' | 'trend' | 'gap';
}

export default function HomePage() {
  const [selectedNode, setSelectedNode] = useState<ArticleNode | null>(null)
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterCitations, setFilterCitations] = useState<string>('all')
  const [scale, setScale] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPatterns, setShowPatterns] = useState(false)
  const [highlightedPattern, setHighlightedPattern] = useState<Pattern | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const { data: articles = [], loading: loadingArticles, error: articlesError, refetch: refetchArticles } = useApi<ArticleNode[]>('/articles', [])
  const { data: edges = [], loading: loadingEdges, error: edgesError, refetch: refetchEdges } = useApi<ArticleEdge[]>('/graph/edges', [])
  const { data: patterns = [], loading: loadingPatterns, error: patternsError } = useApi<Pattern[]>('/patterns', [])

  const mockNodes: ArticleNode[] = articles.length > 0 ? articles : [
    { id: 'a1', title: 'P53 signaling pathway in cancer', year: 2023, citations: 145, category: 'Oncology', author: 'Smith et al.', abstract: 'This study investigates...', keywords: ['P53', 'cancer', 'signaling'] },
    { id: 'a2', title: 'MDM2 regulation mechanisms', year: 2022, citations: 98, category: 'Oncology', author: 'Johnson et al.', abstract: 'MDM2 is a key regulator...', keywords: ['MDM2', 'P53', 'regulation'] },
    { id: 'a3', title: 'AKT1 network analysis', year: 2024, citations: 87, category: 'Bioinformatics', author: 'Williams et al.', abstract: 'Network analysis of AKT1...', keywords: ['AKT1', 'network', 'bioinformatics'] },
    { id: 'a4', title: 'EGFR inhibition strategies', year: 2023, citations: 112, category: 'Oncology', author: 'Brown et al.', abstract: 'Novel EGFR inhibitors...', keywords: ['EGFR', 'inhibition', 'cancer'] },
    { id: 'a5', title: 'PTEN tumor suppressor', year: 2021, citations: 234, category: 'Oncology', author: 'Davis et al.', abstract: 'PTEN role in tumor...', keywords: ['PTEN', 'tumor', 'suppressor'] },
    { id: 'a6', title: 'ATP metabolism in cancer', year: 2024, citations: 76, category: 'Metabolism', author: 'Garcia et al.', abstract: 'Metabolic changes in cancer...', keywords: ['ATP', 'metabolism', 'cancer'] },
    { id: 'a7', title: 'Glucose transport mechanisms', year: 2022, citations: 89, category: 'Metabolism', author: 'Martinez et al.', abstract: 'Glucose transport pathways...', keywords: ['glucose', 'transport', 'metabolism'] },
    { id: 'a8', title: 'BAX apoptosis pathway', year: 2023, citations: 67, category: 'Oncology', author: 'Lee et al.', abstract: 'BAX-mediated apoptosis...', keywords: ['BAX', 'apoptosis', 'cancer'] },
  ]

  const mockEdges: ArticleEdge[] = edges.length > 0 ? edges : [
    { id: 'e1', source: 'a1', target: 'a2', strength: 0.85, type: 'citation' },
    { id: 'e2', source: 'a1', target: 'a4', strength: 0.72, type: 'collaboration' },
    { id: 'e3', source: 'a3', target: 'a4', strength: 0.68, type: 'reference' },
    { id: 'e4', source: 'a2', target: 'a5', strength: 0.91, type: 'citation' },
    { id: 'e5', source: 'a6', target: 'a7', strength: 0.63, type: 'collaboration' },
    { id: 'e6', source: 'a7', target: 'a8', strength: 0.57, type: 'reference' },
    { id: 'e7', source: 'a3', target: 'a8', strength: 0.74, type: 'citation' },
    { id: 'e8', source: 'a1', target: 'a8', strength: 0.81, type: 'reference' },
  ]

  const tutorialSteps = [
    { title: 'Фильтрация', description: 'Используйте фильтры для сужения результатов' },
    { title: 'Поиск', description: 'Введите ключевые слова для поиска статей' },
    { title: 'Выбор', description: 'Кликните на узел для просмотра деталей' },
    { title: 'Анализ', description: 'Исследуйте паттерны и связи между статьями' },
    { title: 'Экспорт', description: 'Сохраните или экспортируйте результаты' },
  ]

  const filteredNodes = mockNodes.filter(node => {
    if (filterYear !== 'all' && node.year !== parseInt(filterYear)) return false
    if (filterCategory !== 'all' && node.category !== filterCategory) return false
    if (filterCitations === 'high' && node.citations < 100) return false
    if (filterCitations === 'medium' && (node.citations < 50 || node.citations >= 100)) return false
    if (filterCitations === 'low' && node.citations >= 50) return false
    if (searchQuery && !node.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !node.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))) return false
    return true
  })

  const categories = ['all', ...Array.from(new Set(mockNodes.map(n => n.category)))]
  const years = ['all', ...Array.from(new Set(mockNodes.map(n => n.year.toString())))]

  const getNodePosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI
    const radius = 200 * scale
    return {
      x: Math.cos(angle) * radius + 400,
      y: Math.sin(angle) * radius + 300
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError('')
    
    try {
      const parsedData = await parseFile(file)
      const graph = buildGraphFromParsedData(parsedData)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/graphs/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке файла на сервер')
      }
      
      const result = await response.json()
      
      toast.success(`Файл загружен успешно! Обработано ${parsedData.articles.length} статей`)
      
      refetchArticles()
      refetchEdges()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      setUploadError(errorMessage)
      toast.error(`Ошибка: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const isNodeHighlighted = (nodeId: string) => {
    return highlightedPattern?.nodes.includes(nodeId)
  }

  const handleSaveResults = () => {
    const dataToSave = {
      nodes: filteredNodes,
      edges: mockEdges.filter(edge => 
        filteredNodes.some(n => n.id === edge.source) && 
        filteredNodes.some(n => n.id === edge.target)
      ),
      filters: {
        year: filterYear,
        category: filterCategory,
        citations: filterCitations,
        searchQuery
      },
      timestamp: new Date().toISOString()
    }

    try {
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `graph-analyser-results-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Результаты успешно сохранены')
    } catch (error) {
      toast.error('Ошибка при сохранении результатов')
      console.error('Save error:', error)
    }
  }

  const handleExportGraph = () => {
    const graphData = {
      nodes: filteredNodes.map(node => ({
        id: node.id,
        label: node.title,
        group: node.category,
        attributes: {
          year: node.year,
          citations: node.citations,
          author: node.author,
          keywords: node.keywords
        }
      })),
      edges: mockEdges.filter(edge => 
        filteredNodes.some(n => n.id === edge.source) && 
        filteredNodes.some(n => n.id === edge.target)
      ).map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        weight: edge.strength,
        type: edge.type
      })),
      metadata: {
        exportDate: new Date().toISOString(),
        totalNodes: filteredNodes.length,
        totalEdges: mockEdges.filter(edge => 
          filteredNodes.some(n => n.id === edge.source) && 
          filteredNodes.some(n => n.id === edge.target)
        ).length
      }
    }

    try {
      const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `graph-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Граф успешно экспортирован')
    } catch (error) {
      toast.error('Ошибка при экспорте графа')
      console.error('Export error:', error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Graph Analyser - Анализ научных статей
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Профессиональный инструмент для интерактивного анализа научных статей,
          визуализации связей и поиска исследовательских пробелов
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Пошаговое руководство</h3>
        <div className="flex flex-wrap gap-3">
          {tutorialSteps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 min-w-[150px] p-3 rounded-lg cursor-pointer transition-all ${
                currentStep === index ? 'bg-primary-500 text-white shadow-lg' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="text-2xl mb-1">{index + 1}</div>
              <div className="font-medium text-sm">{step.title}</div>
              <div className="text-xs mt-1 opacity-75">{step.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Загрузка данных из файла</h3>
        <FileUploader
          onFileUpload={handleFileUpload}
          isLoading={isUploading}
          error={uploadError}
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введите ключевые слова..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Фильтр по году</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'Все годы' : year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Фильтр по категории</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Все категории' : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Фильтр по цитированиям</label>
            <select
              value={filterCitations}
              onChange={(e) => setFilterCitations(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Все</option>
              <option value="high">Высокие (&ge; 100)</option>
              <option value="medium">Средние (50-99)</option>
              <option value="low">Низкие (&lt; 50)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Масштаб</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => { setFilterYear('all'); setFilterCategory('all'); setFilterCitations('all'); setSearchQuery(''); setScale(1) }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Сбросить
            </button>
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {showPatterns ? 'Скрыть паттерны' : 'Показать паттерны'}
            </button>
          </div>
        </div>

        {showPatterns && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">🔍 Обнаруженные паттерны</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patterns.map(pattern => (
                <div
                  key={pattern.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    highlightedPattern?.id === pattern.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white hover:bg-purple-100 border-2 border-purple-200'
                  }`}
                  onClick={() => setHighlightedPattern(highlightedPattern?.id === pattern.id ? null : pattern)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {pattern.type === 'cluster' ? '🔗' : pattern.type === 'trend' ? '📈' : '🔬'}
                    </span>
                    <h5 className="font-semibold">{pattern.name}</h5>
                  </div>
                  <p className="text-sm mb-2">{pattern.description}</p>
                  <div className="text-xs opacity-75">
                    {pattern.nodes.length} связанных статей
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 600">
            <defs>
              <marker id="arrowhead-citation" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
              </marker>
              <marker id="arrowhead-reference" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
              <marker id="arrowhead-collaboration" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
            </defs>

            {mockEdges.filter(edge => 
              filteredNodes.some(n => n.id === edge.source) && 
              filteredNodes.some(n => n.id === edge.target)
            ).map(edge => {
              const sourcePos = getNodePosition(filteredNodes.findIndex(n => n.id === edge.source), filteredNodes.length)
              const targetPos = getNodePosition(filteredNodes.findIndex(n => n.id === edge.target), filteredNodes.length)
              const isSelected = selectedNode?.id === edge.source || selectedNode?.id === edge.target
              const isHighlighted = highlightedPattern?.nodes.includes(edge.source) || highlightedPattern?.nodes.includes(edge.target)
              const color = edge.type === 'citation' ? '#4f46e5' : edge.type === 'reference' ? '#10b981' : '#f59e0b'

              return (
                <line
                  key={edge.id}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={isHighlighted ? '#8b5cf6' : color}
                  strokeWidth={edge.strength * 3 * scale}
                  markerEnd={`url(#arrowhead-${edge.type})`}
                  className="transition-all duration-300"
                  style={{ cursor: 'pointer', opacity: isHighlighted ? 1 : 0.6 }}
                  onClick={() => setSelectedNode(null)}
                />
              )
            })}

            {filteredNodes.map((node, index) => {
              const pos = getNodePosition(index, filteredNodes.length)
              const isSelected = selectedNode?.id === node.id
              const isHighlighted = isNodeHighlighted(node.id)
              const size = 40 * scale * (1 + node.citations / 500)

              return (
                <g key={node.id} className="cursor-pointer transition-all duration-300">
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={size}
                    fill={isHighlighted ? '#8b5cf6' : isSelected ? '#4f46e5' : '#6366f1'}
                    stroke={isHighlighted ? '#4f46e5' : isSelected ? '#1e40af' : '#4b5563'}
                    strokeWidth={isHighlighted ? 4 : 3}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setSelectedNode(node)}
                    onMouseLeave={() => setSelectedNode(null)}
                    className="hover:fill-indigo-600 transition-colors"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - size - 10}
                    textAnchor="middle"
                    fontSize={14 * scale}
                    fill="#374151"
                    className="pointer-events-none"
                  >
                    {node.year}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + size + 20}
                    textAnchor="middle"
                    fontSize={12 * scale}
                    fill="#6b7280"
                    className="pointer-events-none"
                  >
                    {node.citations} цит.
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="flex flex-wrap justify-between items-center text-sm text-gray-600 mt-4 gap-4">
          <div>
            Показано: <span className="font-semibold text-primary-600">{filteredNodes.length}</span> из {mockNodes.length} статей
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
              <span>Цитирование</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>Ссылка</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span>Коллаборация</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSaveResults}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              💾 Сохранить результаты
            </button>
            <button 
              onClick={handleExportGraph}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              📊 Экспорт графа
            </button>
          </div>
        </div>
      </div>

      {selectedNode && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-xl p-6 max-w-sm z-50 border-l-4 border-primary-500">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedNode.title}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Автор:</span>
              <span className="font-medium">{selectedNode.author}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Год:</span>
              <span className="font-medium">{selectedNode.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Цитирования:</span>
              <span className="font-medium text-primary-600">{selectedNode.citations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Категория:</span>
              <span className="font-medium">{selectedNode.category}</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 mb-1">Ключевые слова:</div>
            <div className="flex flex-wrap gap-2">
              {selectedNode.keywords.map(keyword => (
                <span key={keyword} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700 mb-1">Аннотация:</div>
            <p className="text-sm text-gray-600 line-clamp-3">{selectedNode.abstract}</p>
          </div>
          <div className="mt-4 space-y-2">
            <Link
              to="/graph"
              className="block w-full text-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Подробный анализ
            </Link>
            <button
              onClick={() => setSelectedNode(null)}
              className="block w-full text-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="Загрузка статей"
          description="Импортируйте статьи из web-ссылок или библиографических данных"
          link="/upload"
          icon="📥"
        />
        <FeatureCard
          title="Анализ данных"
          description="Автоматическое извлечение сущностей и взаимодействий"
          link="/analysis"
          icon="🔍"
        />
        <FeatureCard
          title="Графовый анализ"
          description="Интерактивная визуализация биохимических сетей с фильтрацией"
          link="/graph"
          icon="🕸️"
        />
        <FeatureCard
          title="Research Gaps"
          description="Находите пробелы в исследованиях для публикации в Q1"
          link="/research-gaps"
          icon="🔬"
        />
        <FeatureCard
          title="Статистика"
          description="Детальная статистика по анализируемым данным"
          link="/statistics"
          icon="📈"
        />
        <FeatureCard
          title="Экспорт данных"
          description="Экспортируйте результаты для публикации"
          link="/export"
          icon="💾"
        />
      </div>
    </div>
  )
}

function FeatureCard({ title, description, link, icon }: { title: string; description: string; link: string; icon: string }) {
  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  )
}
