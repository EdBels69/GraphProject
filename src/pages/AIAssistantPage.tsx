import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          AI-помощник для сбора данных
        </h1>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600 mb-4">
          Страница AI-помощника в разработке...
        </p>
        <p className="text-sm text-gray-500">
          Здесь будет чат-интерфейс с AI-помощником для сбора данных из Google Scholar и PubMed
        </p>
      </div>
    </div>
  )
}
