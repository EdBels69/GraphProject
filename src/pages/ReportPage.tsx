import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileDown, Activity, Users, Tag, BarChart2, BookOpen, Clock, Globe } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

interface ArticleDetails {
  id: string
  title: string
  year: number
  category: string
  author: string
  abstract: string
  keywords: string[]
  citations: number
}

interface GraphStats {
  totalNodes: number
  totalEdges: number
  density: number
  averageDegree: number
}

export default function ReportPage() {
  const { id = 'a1' } = useParams<{ id: string }>()
  const { data: article, loading, error } = useApi<ArticleDetails>(`/articles/${id}`)

  // Mock graph stats for the report
  const graphStats: GraphStats = {
    totalNodes: 12,
    totalEdges: 13,
    density: 19.7,
    averageDegree: 2.17
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Card className="bg-red-50 border-red-200">
          <CardBody className="text-red-700">
            <h2 className="text-xl font-bold mb-2">Ошибка загрузки отчета</h2>
            <p className="mb-6">{error || 'Отчет не найден'}</p>
            <Link to="/works">
              <Button variant="secondary">Вернуться к списку</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/works">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Отчет: {article.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {article.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {article.year} год
              </span>
            </div>
          </div>
        </div>
        <Button className="shrink-0">
          <FileDown className="w-4 h-4 mr-2" />
          Экспорт в PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Summary Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">AI Аннотация и резюме</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-gray-700 leading-relaxed italic">
                {article.abstract || 'Аннотация отсутствует. AI-модель анализирует полный текст статьи для формирования расширенного резюме...'}
              </p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Ключевые выводы
                </h4>
                <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                  <li>Высокая плотность узлов в сигнальном пути {article.category}</li>
                  <li>Обнаружена сильная корреляция между ключевыми маркерами</li>
                  <li>Рекомендуется дополнительное исследование в области P53</li>
                </ul>
              </div>
            </CardBody>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Ключевые слова и теги</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {article.keywords?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {article.category}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
            <CardHeader className="border-blue-500/30">
              <h3 className="font-bold">Метрики графа</h3>
            </CardHeader>
            <CardBody className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-blue-100 text-xs uppercase font-semibold">Узлов</p>
                <p className="text-2xl font-bold">{graphStats.totalNodes}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-xs uppercase font-semibold">Связей</p>
                <p className="text-2xl font-bold">{graphStats.totalEdges}</p>
              </div>
              <div className="text-center col-span-2 pt-2 border-t border-blue-500/30">
                <p className="text-blue-100 text-xs uppercase font-semibold">Плотность сети</p>
                <p className="text-2xl font-bold">{graphStats.density}%</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold text-gray-900">Общая информация</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Цитирования</p>
                  <p className="text-sm font-medium text-gray-900">{article.citations} ссылок</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Категория</p>
                  <p className="text-sm font-medium text-gray-900">{article.category}</p>
                </div>
              </div>
              <Link to="/analysis" className="block">
                <Button variant="secondary" className="w-full">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Перейти к анализу
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
