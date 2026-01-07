import { Button } from '@/components/ui/Button'

export default function WorkListPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Список работ
        </h1>
        <Button>
          Новая работа
        </Button>
      </div>

      {/* Content placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600 mb-4">
          Страница списка работ в разработке...
        </p>
        <p className="text-sm text-gray-500">
          Здесь будет таблица всех проанализированных работ с доступом к графовому анализу
        </p>
      </div>
    </div>
  )
}
