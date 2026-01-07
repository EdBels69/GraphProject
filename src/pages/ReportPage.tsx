import { ArrowLeft, FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function ReportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/analysis">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Анализ
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Отчет: P53 signaling pathway
          </h1>
        </div>
        <Button>
          <FileDown className="w-4 h-4 mr-2" />
          Экспорт в Word
        </Button>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600 mb-4">
          Страница отчета в разработке...
        </p>
        <p className="text-sm text-gray-500">
          Здесь будет вертикально прокручиваемая страница с основными результатами, 
          интерактивными графами и AI-интерпретацией
        </p>
      </div>
    </div>
  )
}
