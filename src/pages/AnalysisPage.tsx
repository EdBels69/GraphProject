import { useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'

interface AnalysisStep {
  description: string;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
}

export default function AnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps: AnalysisStep[] = [
    { description: 'Извлечение сущностей', status: 'completed', progress: 100 },
    { description: 'Выявление взаимодействий', status: 'completed', progress: 100 },
    { description: 'Графовый анализ', status: isPaused ? 'pending' : isAnalyzing ? 'processing' : 'completed', progress: isAnalyzing ? progress : isPaused ? 0 : 100 },
    { description: 'Метрики центральности', status: 'pending', progress: 0 },
    { description: 'Выявление сообществ', status: 'pending', progress: 0 },
    { description: 'Статистическая валидация', status: 'pending', progress: 0 },
  ]

  const handleStartAnalysis = async () => {
    if (isAnalyzing) return
    
    try {
      setIsAnalyzing(true)
      setIsPaused(false)
      setCurrentStep(2)
      setProgress(0)
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsAnalyzing(false)
            setCurrentStep(3)
            return 100
          }
          return prev + 10
        })
      }, 300)
      
      toast.success('Анализ запущен')
    } catch (error) {
      console.error('Failed to start analysis:', error)
      toast.error('Не удалось запустить анализ')
      setIsAnalyzing(false)
    }
  }

  const handlePause = () => {
    if (!isAnalyzing && !isPaused) return
    
    setIsPaused(true)
    setIsAnalyzing(false)
    toast.info('Анализ приостановлен')
  }

  const handleResume = () => {
    if (!isPaused) return
    
    setIsPaused(false)
    setIsAnalyzing(true)
    toast.info('Анализ продолжен')
  }

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/export/analysis')
      
      if (response.data.success) {
        const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analysis-results-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success('Результаты успешно экспортированы')
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Не удалось экспортировать результаты')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Анализ данных
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatusCard
            title="Извлечение сущностей"
            status="completed"
            progress={100}
            items={[
              'Белки: 1,234',
              'Гены: 856',
              'Метаболиты: 423',
            ]}
          />
          <StatusCard
            title="Выявление взаимодействий"
            status="completed"
            progress={100}
            items={[
              'Белок-белок: 3,456',
              'Белок-ДНК: 234',
              'Метаболические связи: 892',
            ]}
          />
          <StatusCard
            title="Графовый анализ"
            status={isPaused ? 'pending' : isAnalyzing ? 'processing' : 'completed'}
            progress={isAnalyzing ? progress : isPaused ? 0 : 100}
            items={[
              'Метрики центральности',
              'Выявление сообществ',
              'Статистическая валидация',
            ]}
          />
        </div>

        <div className="space-y-6">
          <SummaryCard
            title="Общая статистика"
            data={{
              'Всего статей': '47',
              'Извлечено сущностей': '2,513',
              'Выявлено взаимодействий': '4,582',
              'Найдено сообществ': '23',
            }}
          />
          <SummaryCard
            title="Качество данных"
            data={{
              'Уверенность извлечения': '94.2%',
              'Покрытие статей': '87.5%',
              'Воспроизводимость': '98.1%',
            }}
          />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Детальные результаты
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Статья</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Сущности</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Взаимодействия</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Статус</th>
            </tr>
          </thead>
          <tbody>
            {[
              { title: 'P53-MDM2 pathway in cancer', entities: 45, interactions: 67, status: 'completed' },
              { title: 'Metabolic reprogramming in tumors', entities: 38, interactions: 52, status: 'completed' },
              { title: 'BRCA1/2 DNA repair mechanisms', entities: 62, interactions: 89, status: isPaused ? 'pending' : isAnalyzing ? 'processing' : 'completed' },
            ].map((article, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-3">{article.title}</td>
                <td className="px-4 py-3">{article.entities}</td>
                <td className="px-4 py-3">{article.interactions}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    article.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.status === 'completed' ? '✓ Готово' : '⏳ В процессе'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isAnalyzing && (
              <>
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-700">Анализируем данные... ({progress}%)</span>
                </div>
              </>
            )}
            
            {isPaused && (
              <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg">
                <span>⏸️ Анализ приостановлен</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {!isAnalyzing && !isPaused && !isPaused && (
              <button
                onClick={handleStartAnalysis}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🚀 Начать анализ
              </button>
            )}
            
            {isAnalyzing && !isPaused && (
              <button
                onClick={handlePause}
                disabled={progress >= 100}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                ⏸️ Пауза
              </button>
            )}
            
            {isPaused && (
              <button
                onClick={handleResume}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ▶️ Продолжить
              </button>
            )}
            
            <button
              onClick={handleExport}
              disabled={isAnalyzing && !isPaused}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              📥 Экспорт
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusCard({ title, status, progress, items }: { title: string; status: string; progress: number; items: string[] }) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status as keyof typeof statusColors]}`}>
          {status === 'completed' ? '✓ Завершено' : status === 'processing' ? '⏳ В процессе' : '⏸️ Ожидание'}
        </span>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Прогресс</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center text-sm text-gray-700">
            <span className="mr-2">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SummaryCard({ title, data }: { title: string; data: Record<string, string> }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-600">{key}</span>
            <span className="font-semibold text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
