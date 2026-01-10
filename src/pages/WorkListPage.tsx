import { useNavigate } from 'react-router-dom'
import { FileText, Search, BarChart2, Shield, Trash2, ExternalLink } from 'lucide-react'
import { useApi, useApiDelete } from '@/hooks/useApi'
import { API_ENDPOINTS } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'

interface Article {
  id: string
  title: string
  year: number
  category: string
  author: string
  url?: string
}

export default function WorkListPage() {
  const navigate = useNavigate()
  const { data: articles, loading, error, refetch } = useApi<Article[]>(API_ENDPOINTS.ARTICLES.BASE)
  const { deleteData } = useApiDelete<any>((id: string) => API_ENDPOINTS.ARTICLES.BY_ID(id))

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту работу?')) return

    try {
      await deleteData(id)
      refetch()
    } catch (err) {
      console.error('Failed to delete article:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Список работ
          </h1>
          <p className="text-gray-500 mt-1">
            История проанализированных публикаций и графов
          </p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          <FileText className="w-4 h-4 mr-2" />
          Новая работа
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200">
          <CardBody className="text-red-700 text-center py-12">
            Ошибка при загрузке данных: {error}
          </CardBody>
        </Card>
      ) : articles?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">
            Список работ пуст
          </p>
          <Button variant="secondary" onClick={() => navigate('/upload')}>
            Загрузить первый файл
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Название</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Автор</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Год</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Категория</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles?.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                        {article.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {article.author}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {article.year}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Открыть источник"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/report/${article.id}`)}
                          title="Открыть отчет"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/analysis`)}
                          title="Графовый анализ"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
