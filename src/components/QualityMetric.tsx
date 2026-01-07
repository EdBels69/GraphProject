interface QualityMetricProps {
  title: string
  value: string
  trend: 'up' | 'down' | 'stable'
  description: string
}

export function QualityMetric({ title, value, trend, description }: QualityMetricProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→',
  }

  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <div className="text-lg font-semibold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-xs text-gray-500">
        <span className={trendColors[trend]}>{trendIcons[trend]}</span> {description}
      </div>
    </div>
  )
}
