interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple'
}

export function StatCard({ title, value, change, trend, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  }

  const trendIcons = {
    up: '📈',
    down: '📉',
    neutral: '➖',
  }

  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {icon && <span className="ml-2 text-2xl">{icon}</span>}
        </div>
        {trend && change && (
          <div className={`flex items-center ${trendColorClasses[trend]}`}>
            <span className="mr-1">{trendIcons[trend]}</span>
            <span className="font-semibold">{change}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  )
}
