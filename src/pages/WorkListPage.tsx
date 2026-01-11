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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ash/10">
        <div className="space-y-4">
          <h1 className="text-steel">
            Список работ
          </h1>
          <p className="text-lg font-normal text-steel-dim max-w-lg">
            История проанализированных публикаций и графов
          </p>
        </div>
        <Button onClick={() => navigate('/upload')} className="h-12 px-10 text-base">
          <FileText className="w-5 h-5 mr-2" />
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
        <div className="glass-panel-heavy rounded-[2rem] p-24 text-center space-y-6 border-dashed border-2 border-ash/10 bg-void/30">
          <div className="w-20 h-20 bg-void border border-ash/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <BarChart2 className="w-8 h-8 text-steel-dim/30" />
          </div>
          <div className="space-y-4">
            <h3 className="text-steel font-semibold">Список работ пуст</h3>
            <p className="text-steel-dim text-base font-normal">Ваш архив пока пуст</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/upload')} className="px-10 h-12 text-sm">
            Загрузить первый файл
          </Button>
        </div>
      ) : (
        <Card className="overflow-hidden border-ash/20 bg-white shadow-xl rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-ash/40 text-sm font-semibold text-steel-dim">
                  <th className="px-6 py-5">Название</th>
                  <th className="px-6 py-5">Автор</th>
                  <th className="px-6 py-5">Год</th>
                  <th className="px-6 py-5">Категория</th>
                  <th className="px-6 py-5 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ash/10">
                {articles?.map((article) => (
                  <tr key={article.id} className="hover:bg-steel/5 transition-all group">
                    <td className="px-6 py-4">
                      <div className="text-base font-bold text-steel max-w-md truncate group-hover:text-acid transition-colors">
                        {article.title}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-base font-normal text-steel-dim truncate max-w-[200px]">
                      {article.author}
                    </td>
                    <td className="px-6 py-5 text-base font-normal text-steel-dim">
                      {article.year}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs font-semibold bg-zinc-100 border border-ash/40 text-steel">
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
