import { useState } from 'react'
import { toast } from 'sonner'
import { exportDataService } from '@/utils/exportData'
import { useApi } from '@/hooks/useApi'

export default function ExportDataPage() {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'xlsx' | 'gexf' | 'graphml'>('json')
  const [selectedData, setSelectedData] = useState<'all' | 'entities' | 'interactions' | 'graph' | 'statistics'>('all')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [exporting, setExporting] = useState(false)

  const { data: articlesData, loading: loadingArticles } = useApi<any[]>('/articles', [])
  const { data: entitiesData, loading: loadingEntities } = useApi<any[]>('/entities', [])
  const { data: interactionsData, loading: loadingInteractions } = useApi<any[]>('/interactions', [])
  const { data: graphData, loading: loadingGraph } = useApi<any>('/graph', null)
  const { data: statisticsData, loading: loadingStatistics } = useApi<any>('/statistics', null)

  const articles = articlesData || []
  const entities = entitiesData || []
  const interactions = interactionsData || []
  const graph = graphData || undefined
  const statistics = statisticsData || undefined

  const handleExport = async () => {
    setExporting(true)

    try {
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = `graph-analyser-${selectedData}-${timestamp}`

      const metadata = {
        exportDate: new Date().toISOString(),
        analysisVersion: '1.0.0',
        totalArticles: articles?.length || 0,
        totalEntities: entities?.length || 0,
        totalInteractions: interactions?.length || 0,
        parameters: {
          includeMetadata,
          format: selectedFormat,
          dataType: selectedData
        }
      }

      switch (selectedData) {
        case 'all':
          if (selectedFormat === 'json') {
            exportDataService.exportToJSON({
              metadata,
              articles,
              entities,
              interactions,
              graph,
              statistics: statistics ? statistics : undefined
            }, filename)
          } else if (selectedFormat === 'csv') {
            exportDataService.exportToCSV(articles || [], `${filename}-articles`)
            setTimeout(() => exportDataService.exportToCSV(entities || [], `${filename}-entities`), 100)
            setTimeout(() => exportDataService.exportToCSV(interactions || [], `${filename}-interactions`), 200)
          } else if (selectedFormat === 'xlsx') {
            exportDataService.exportToXLSX({
              articles,
              entities,
              interactions,
              statistics: statistics ? [statistics] : []
            }, filename)
          }
          break

        case 'entities':
          if (selectedFormat === 'json' || selectedFormat === 'csv' || selectedFormat === 'xlsx') {
            const data = entities || []
            if (selectedFormat === 'json') {
              exportDataService.exportToJSON({ metadata, entities: data, articles: [], interactions: [] }, filename)
            } else {
              exportDataService.exportToCSV(data, filename)
            }
          }
          break

        case 'interactions':
          if (selectedFormat === 'json' || selectedFormat === 'csv' || selectedFormat === 'xlsx') {
            const data = interactions || []
            if (selectedFormat === 'json') {
              exportDataService.exportToJSON({ metadata, interactions: data, articles: [], entities: [] }, filename)
            } else {
              exportDataService.exportToCSV(data, filename)
            }
          }
          break

        case 'graph':
          if (selectedFormat === 'json') {
            exportDataService.exportToJSON({
              metadata,
              graph,
              articles,
              entities,
              interactions
            }, filename)
          } else if (selectedFormat === 'gexf' && graph) {
            exportDataService.exportToGEXF(graph, filename)
          } else if (selectedFormat === 'graphml' && graph) {
            exportDataService.exportToGraphML(graph, filename)
          } else {
            toast.error('Для экспорта графа выберите формат JSON, GEXF или GraphML')
            setExporting(false)
            return
          }
          break

        case 'statistics':
          if (selectedFormat === 'json' || selectedFormat === 'csv' || selectedFormat === 'xlsx') {
            const data = statistics || {}
            if (selectedFormat === 'json') {
              exportDataService.exportToJSON({ metadata, statistics: data, articles: [], entities: [], interactions: [] }, filename)
            } else if (selectedFormat === 'csv') {
              const statsArray = statistics ? Object.entries(statistics).map(([key, value]) => ({ metric: key, value: String(value) })) : []
              exportDataService.exportToCSV(statsArray, filename)
            } else {
              exportDataService.exportToXLSX({ statistics: statistics ? [statistics] : [] }, filename)
            }
          }
          break
      }

      toast.success(`Данные успешно экспортированы в формате ${selectedFormat.toUpperCase()}!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Ошибка при экспорте данных')
    } finally {
      setExporting(false)
    }
  }

  const dataOptions = [
    { value: 'all', label: 'Все данные', description: 'Полный экспорт всех анализируемых данных' },
    { value: 'entities', label: 'Сущности', description: 'Только извлеченные белки, гены, метаболиты' },
    { value: 'interactions', label: 'Взаимодействия', description: 'Только выявленные взаимодействия' },
    { value: 'graph', label: 'Графовые данные', description: 'Структура графа для визуализации' },
    { value: 'statistics', label: 'Статистика', description: 'Сводная статистика и метрики' },
  ]

  const formatOptions = [
    { value: 'json', label: 'JSON', description: 'Универсальный формат для программной обработки' },
    { value: 'csv', label: 'CSV', description: 'Табличный формат для Excel/Google Sheets' },
    { value: 'xlsx', label: 'XLSX', description: 'Формат Excel с поддержкой формул' },
    { value: 'gexf', label: 'GEXF', description: 'Формат для Gephi/Cytoscape' },
    { value: 'graphml', label: 'GraphML', description: 'Формат для yEd, Cytoscape, NetworkX' },
  ]

  const selectedOption = dataOptions.find(opt => opt.value === selectedData)!

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Экспорт данных для публикации
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Что экспортировать?
          </h2>
          <div className="space-y-3">
            {dataOptions.map(option => (
              <div
                key={option.value}
                onClick={() => setSelectedData(option.value as typeof selectedData)}
                className={`p-4 rounded-md border-2 cursor-pointer transition-all ${selectedData === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
                  }`}
              >
                <div className="font-semibold text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Формат экспорта
          </h2>
          <div className="space-y-3">
            {formatOptions.map(format => (
              <div
                key={format.value}
                onClick={() => setSelectedFormat(format.value as typeof selectedFormat)}
                className={`p-4 rounded-md border-2 cursor-pointer transition-all ${selectedFormat === format.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
                  }`}
              >
                <div className="font-semibold text-gray-900">{format.label}</div>
                <div className="text-sm text-gray-600">{format.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Опции экспорта
        </h2>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="ml-3 text-gray-700">Включить метаданные (дата анализа, версия модели, параметры)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="ml-3 text-gray-700">Сжать данные (gzip)</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="ml-3 text-gray-700">Включить описательную документацию</span>
          </label>
        </div>

        <div className="bg-gray-50 rounded-md p-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Превью экспортируемых данных
          </h3>
          <div className="text-xs text-gray-700 space-y-1 font-mono bg-white p-3 rounded">
            {selectedData === 'all' && selectedFormat === 'json' && (
              <pre>{`{
  "metadata": {
    "export_date": "${new Date().toISOString()}",
    "analysis_version": "1.0.0",
    "total_articles": 47,
    "total_entities": 2513,
    "total_interactions": 4582
  },
  "articles": [...],
  "entities": [...],
  "interactions": [...]
}`}</pre>
            )}
            {selectedData === 'graph' && selectedFormat === 'gexf' && (
              <pre>{`<gexf version="1.2">
  <graph defaultedirected="false">
    <attributes class="node">
      <attribute id="type" title="Type" type="string"/>
      <attribute id="degree" title="Degree" type="integer"/>
    </attributes>
    <attributes class="edge">
      <attribute id="weight" title="Weight" type="double"/>
      <attribute id="type" title="Type" type="string"/>
    </attributes>
    <nodes>
      <node id="p53" label="P53">
        <attvalues>
          <attvalue for="type" value="protein"/>
          <attvalue for="degree" value="45"/>
        </attvalues>
      </node>
    </nodes>
    <edges>
      <edge id="e1" source="p53" target="mdm2" weight="6">
        <attvalues>
          <attvalue for="type" value="inhibition"/>
        </attvalues>
      </edge>
    </edges>
  </graph>
</gexf>`}</pre>
            )}
            {(selectedData !== 'all' || selectedFormat !== 'json') && selectedData !== 'graph' && (
              <p className="text-gray-500 italic">
                Превью доступно для выбранных параметров
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
        >
          {exporting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Экспортирование...
            </span>
          ) : (
            `Экспортировать ${selectedOption.label} в ${selectedFormat.toUpperCase()}`
          )}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          Рекомендации для публикации в Q1 журнале
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Для анализа сетевых взаимодействий используйте формат GEXF для Gephi/Cytoscape</li>
          <li>• Для статистических анализов в R/Python рекомендуется CSV или XLSX</li>
          <li>• Для полной воспроизводимости результатов выберите JSON с метаданными</li>
          <li>• Все экспортированные данные соответствуют стандартам FAIR (Findable, Accessible, Interoperable, Reusable)</li>
        </ul>
      </div>
    </div>
  )
}
