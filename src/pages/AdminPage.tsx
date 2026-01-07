import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

interface SystemMetrics {
  sessions: {
    totalSessions: number
    totalUsers: number
    sessionsPerUser: number[]
  }
  database: {
    articles: number
    edges: number
    patterns: number
    users: number
  }
  errors: {
    totalErrors: number
    errorsByType: Record<string, number>
    errorsByCode: Record<string, number>
    recentErrors: any[]
  }
  logs: any[]
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'database' | 'logs' | 'errors'>('overview')
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('all')

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics')
      if (!response.ok) throw new Error('Failed to load metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearLogs = async () => {
    try {
      const response = await fetch('/api/admin/logs', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to clear logs')
      toast.success('Логи успешно очищены')
      loadMetrics()
    } catch (error) {
      toast.error('Ошибка при очистке логов')
    }
  }

  const handleClearErrors = async () => {
    try {
      const response = await fetch('/api/admin/errors', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to clear errors')
      toast.success('Ошибки успешно очищены')
      loadMetrics()
    } catch (error) {
      toast.error('Ошибка при очистке ошибок')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Панель администратора</h1>
          <p className="text-gray-600">Управление и мониторинг системы</p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          ← Вернуться на главную
        </Link>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Обзор' },
            { id: 'sessions', label: 'Сессии' },
            { id: 'database', label: 'База данных' },
            { id: 'logs', label: 'Логи' },
            { id: 'errors', label: 'Ошибки' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && <OverviewTab metrics={metrics} />}
      {activeTab === 'sessions' && <SessionsTab metrics={metrics} />}
      {activeTab === 'database' && <DatabaseTab metrics={metrics} />}
      {activeTab === 'logs' && <LogsTab metrics={metrics} onClearLogs={handleClearLogs} />}
      {activeTab === 'errors' && <ErrorsTab metrics={metrics} onClearErrors={handleClearErrors} />}
    </div>
  )
}

function OverviewTab({ metrics }: { metrics: SystemMetrics | null }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Активные сессии"
          value={metrics?.sessions?.totalSessions || 0}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Пользователи"
          value={metrics?.sessions?.totalUsers || 0}
          icon="👤"
          color="green"
        />
        <MetricCard
          title="Статей в базе"
          value={metrics?.database?.articles || 0}
          icon="📄"
          color="purple"
        />
        <MetricCard
          title="Ошибок за сессию"
          value={metrics?.errors?.totalErrors || 0}
          icon="⚠️"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Статистика базы данных</h3>
          <div className="space-y-3">
            <StatRow label="Статьи" value={metrics?.database?.articles || 0} color="blue" />
            <StatRow label="Связи" value={metrics?.database?.edges || 0} color="green" />
            <StatRow label="Паттерны" value={metrics?.database?.patterns || 0} color="purple" />
            <StatRow label="Пользователи" value={metrics?.database?.users || 0} color="orange" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Распределение сессий</h3>
          {metrics?.sessions?.sessionsPerUser && metrics.sessions.sessionsPerUser.length > 0 ? (
            <div className="space-y-2">
              {metrics.sessions.sessionsPerUser.map((count, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Пользователь {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${(count / Math.max(...metrics.sessions.sessionsPerUser)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Нет активных сессий</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SessionsTab({ metrics }: { metrics: SystemMetrics | null }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Детали сессий</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatRow label="Всего сессий" value={metrics?.sessions?.totalSessions || 0} color="blue" />
          <StatRow label="Уникальных пользователей" value={metrics?.sessions?.totalUsers || 0} color="green" />
        </div>
        {metrics?.sessions?.sessionsPerUser && metrics.sessions.sessionsPerUser.length > 0 ? (
          <div>
            <h4 className="text-md font-medium mb-2">Сессии по пользователям</h4>
            <div className="space-y-2">
              {metrics.sessions.sessionsPerUser.map((count, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Пользователь {index + 1}</span>
                  <span className="text-sm font-medium text-primary-600">{count} сессий</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Нет активных сессий</p>
        )}
      </div>
    </div>
  )
}

function DatabaseTab({ metrics }: { metrics: SystemMetrics | null }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Статистика базы данных</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-md font-medium">Сущности</h4>
          <div className="space-y-2">
            <StatRow label="Статьи" value={metrics?.database?.articles || 0} color="blue" />
            <StatRow label="Связи (edges)" value={metrics?.database?.edges || 0} color="green" />
            <StatRow label="Паттерны" value={metrics?.database?.patterns || 0} color="purple" />
            <StatRow label="Пользователи" value={metrics?.database?.users || 0} color="orange" />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-md font-medium">Состояние системы</h4>
          <div className="space-y-2">
            <StatusItem label="База данных" status="active" />
            <StatusItem label="API сервер" status="active" />
            <StatusItem label="Система логирования" status="active" />
            <StatusItem label="Менеджер сессий" status="active" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LogsTab({ metrics, onClearLogs }: { metrics: SystemMetrics | null; onClearLogs: () => void }) {
  const [expandedLog, setExpandedLog] = useState<number | null>(null)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Системные логи</h3>
        <button
          onClick={onClearLogs}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Очистить логи
        </button>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {metrics?.logs && metrics.logs.length > 0 ? (
          metrics.logs.map((log, index) => (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden ${
                expandedLog === index ? 'border-primary-500' : 'border-gray-200'
              }`}
            >
              <div
                className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedLog(expandedLog === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <LogLevelBadge level={log.level} />
                  <span className="text-sm text-gray-600">{log.module}</span>
                  <span className="text-xs text-gray-500 ml-auto">{new Date(log.timestamp).toLocaleString('ru-RU')}</span>
                </div>
                <div className="mt-2 text-sm text-gray-900">{log.message}</div>
              </div>
              {expandedLog === index && (
                <div className="p-3 bg-gray-50 border-t">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Нет записей в логах</p>
        )}
      </div>
    </div>
  )
}

function ErrorsTab({ metrics, onClearErrors }: { metrics: SystemMetrics | null; onClearErrors: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Статистика ошибок</h3>
          <div className="space-y-2">
            <StatRow label="Всего ошибок" value={metrics?.errors?.totalErrors || 0} color="red" />
            {metrics?.errors?.errorsByType && Object.entries(metrics.errors.errorsByType).length > 0 && (
              <div>
                <h4 className="text-md font-medium mt-4 mb-2">По типам</h4>
                {Object.entries(metrics.errors.errorsByType).map(([type, count]) => (
                  <StatRow key={type} label={type} value={count} color="red" />
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClearErrors}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors h-fit"
        >
          Очистить ошибки
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Последние ошибки</h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {metrics?.errors?.recentErrors && metrics.errors.recentErrors.length > 0 ? (
            metrics.errors.recentErrors.map((error, index) => (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">{error.type}</span>
                  <span className="text-xs text-gray-600">{error.code}</span>
                </div>
                <div className="text-sm text-gray-900 mb-2">{error.message}</div>
                <div className="text-xs text-gray-500">{new Date(error.timestamp).toLocaleString('ru-RU')}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Нет записей об ошибках</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    orange: 'text-orange-600'
  }

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-lg font-semibold ${colorClasses[color as keyof typeof colorClasses]}`}>{value}</span>
    </div>
  )
}

function StatusItem({ label, status }: { label: string; status: 'active' | 'inactive' | 'error' }) {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Активен' },
    inactive: { color: 'bg-gray-500', text: 'Неактивен' },
    error: { color: 'bg-red-500', text: 'Ошибка' }
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-sm font-medium text-gray-900">{config.text}</span>
      </div>
    </div>
  )
}

function LogLevelBadge({ level }: { level: string }) {
  const levelConfig = {
    DEBUG: { color: 'bg-gray-200 text-gray-700' },
    INFO: { color: 'bg-blue-100 text-blue-700' },
    WARN: { color: 'bg-yellow-100 text-yellow-700' },
    ERROR: { color: 'bg-red-100 text-red-700' },
    FATAL: { color: 'bg-red-600 text-white' }
  }

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.INFO

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${config.color}`}>{level}</span>
  )
}
