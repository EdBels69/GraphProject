import { Link } from 'react-router-dom'
import { FileText, MessageSquare, ArrowRight } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Graph Analyser
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Профессиональный инструмент для анализа научных публикаций, 
            визуализации графов и поиска исследовательских пробелов
          </p>
        </div>

        {/* Method selection cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Option 1: File Upload */}
          <Link to="/upload">
            <Card hover className="h-full">
              <CardBody className="flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  Загрузка Word файлов
                </h2>
                <p className="text-gray-600 mb-6 flex-1">
                  Загрузите свои файлы для анализа с использованием MiMo Flash V. 
                  Результат будет сохранен в Parquet DB.
                </p>
                <Button className="w-full">
                  Начать загрузку
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardBody>
            </Card>
          </Link>

          {/* Option 2: AI Assistant */}
          <Link to="/ai-assistant">
            <Card hover className="h-full">
              <CardBody className="flex flex-col items-center text-center p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  AI-помощник
                </h2>
                <p className="text-gray-600 mb-6 flex-1">
                  Используйте ИИ для сбора данных из Google Scholar и PubMed. 
                  Создайте сценарий сбора и сохраните результаты.
                </p>
                <Button variant="secondary" className="w-full">
                  Начать сбор
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardBody>
            </Card>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Анализ документов
            </h3>
            <p className="text-sm text-gray-600">
              Автоматическое извлечение сущностей и взаимодействий
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              AI-интеграция
            </h3>
            <p className="text-sm text-gray-600">
              Сбор данных из Google Scholar и PubMed
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Экспорт в Word
            </h3>
            <p className="text-sm text-gray-600">
              Генерация отчетов для публикации
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
