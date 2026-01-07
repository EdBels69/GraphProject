import { StatCard } from '@/components/StatCard'
import { QualityMetric } from '@/components/QualityMetric'

export default function StatisticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Статистика анализируемых данных
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего статей"
          value="47"
          change="+5"
          trend="up"
          icon="📚"
          color="blue"
        />
        <StatCard
          title="Извлечено сущностей"
          value="2,513"
          change="+127"
          trend="up"
          icon="🔍"
          color="green"
        />
        <StatCard
          title="Выявлено взаимодействий"
          value="4,582"
          change="+342"
          trend="up"
          icon="🕸️"
          color="purple"
        />
        <StatCard
          title="Найдено сообществ"
          value="23"
          change="+3"
          trend="up"
          icon="🎯"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Распределение по типам сущностей
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Белки</span>
                <span className="font-semibold text-gray-900">1,234</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '49.1%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Гены</span>
                <span className="font-semibold text-gray-900">856</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '34.1%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Метаболиты</span>
                <span className="font-semibold text-gray-900">423</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '16.8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Метрики центральности
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-700">Top 1 по степени:</span>
              <span className="font-semibold text-gray-900">P53 (degree: 45)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-700">Top 1 по betweenness:</span>
              <span className="font-semibold text-gray-900">ATM (betweenness: 0.91)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-700">Средняя степень:</span>
              <span className="font-semibold text-gray-900">27.4</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-700">Средний betweenness:</span>
              <span className="font-semibold text-gray-900">0.69</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Распределение по типам взаимодействий
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Белок-белок</span>
              <span className="font-semibold text-gray-900">3,456 (75.5%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Белок-ДНК</span>
              <span className="font-semibold text-gray-900">234 (5.1%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Метаболические связи</span>
              <span className="font-semibold text-gray-900">892 (19.4%)</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Графическое представление
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Белок-белок', value: 75.5, color: 'bg-blue-500' },
                { label: 'Белок-ДНК', value: 5.1, color: 'bg-green-500' },
                { label: 'Метаболические связи', value: 19.4, color: 'bg-purple-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <span className="w-32 text-sm text-gray-600">{item.label}:</span>
                  <div className="flex-1 ml-2 bg-gray-200 rounded-full h-4">
                    <div className={`${item.color} h-4 rounded-full`} style={{ width: `${item.value}%` }}></div>
                  </div>
                  <span className="ml-2 text-sm font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Динамика во времени
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Период:</span>
              <span className="font-semibold text-gray-900">2020-2024</span>
            </div>
            {[
              { year: '2020', articles: 8, entities: 342, interactions: 456 },
              { year: '2021', articles: 12, entities: 567, interactions: 723 },
              { year: '2022', articles: 15, entities: 789, interactions: 1024 },
              { year: '2023', articles: 12, entities: 815, interactions: 1387 },
            ].map((item) => (
              <div key={item.year} className="flex items-center space-x-2">
                <span className="w-12 text-sm text-gray-700">{item.year}</span>
                <div className="flex-1">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(item.articles / 15) * 100}%` }}></div>
                </div>
                <div className="flex-1">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(item.entities / 815) * 100}%` }}></div>
                </div>
                <div className="flex-1">
                  <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${(item.interactions / 1387) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Статьи</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span>Сущности</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
              <span>Взаимодействия</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Качество данных
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QualityMetric
            title="Уверенность извлечения"
            value="94.2%"
            trend="up"
            description="Средняя уверенность NLP извлечения"
          />
          <QualityMetric
            title="Покрытие статей"
            value="87.5%"
            trend="up"
            description="Процент статей с полным извлечением"
          />
          <QualityMetric
            title="Воспроизводимость"
            value="98.1%"
            trend="stable"
            description="Согласованность между повторными анализами"
          />
          <QualityMetric
            title="Время обработки"
            value="2.3 сек/статья"
            trend="down"
            description="Среднее время анализа одной статьи"
          />
        </div>
      </div>
    </div>
  )
}
