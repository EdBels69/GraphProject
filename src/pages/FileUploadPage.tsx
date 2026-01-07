import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function FileUploadPage() {
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
          Загрузка файлов для анализа
        </h1>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600 mb-4">
          Страница загрузки файлов в разработке...
        </p>
        <p className="text-sm text-gray-500">
          Здесь будет drag-and-drop зона для загрузки Word файлов с использованием MiMo Flash V
        </p>
      </div>
    </div>
  )
}
