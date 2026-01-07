import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function GraphAnalysisPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/works">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Список работ
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Графовый анализ: P53 signaling pathway
        </h1>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600 mb-4">
          Страница графового анализа в разработке...
        </p>
        <p className="text-sm text-gray-500">
          Здесь будет стандартизированный инструментарий для анализа графов
        </p>
      </div>
    </div>
  )
}
