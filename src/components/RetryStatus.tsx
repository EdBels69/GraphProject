import { useState, useEffect } from 'react'
import { RetryHandler, RetryState, RetryLogEntry } from '@/utils/retryHandler'

interface RetryStatusProps {
  retryHandler: RetryHandler | null
  showLogs?: boolean
  onClearLogs?: () => void
  onAbort?: () => void
}

export default function RetryStatus({ retryHandler, showLogs = false, onClearLogs, onAbort }: RetryStatusProps) {
  const [state, setState] = useState<RetryState | null>(null)
  const [logs, setLogs] = useState<RetryLogEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!retryHandler) return

    const updateState = () => {
      setState(retryHandler.getState())
      setLogs(retryHandler.getLogs())
    }

    updateState()

    const interval = setInterval(updateState, 1000)

    window.addEventListener('focus', updateState)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', updateState)
    }
  }, [retryHandler])

  if (!state || !retryHandler) {
    return null
  }

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}ч ${minutes % 60}м ${seconds % 60}с`
    } else if (minutes > 0) {
      return `${minutes}м ${seconds % 60}с`
    } else {
      return `${seconds}с`
    }
  }

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const timeUntilNextRetry = retryHandler?.getTimeUntilNextRetry() ?? null
  const maxRetries = (retryHandler as any)?.config?.maxRetries ?? 5
  const progressPercentage = state.currentAttempt > 0
    ? (state.currentAttempt / maxRetries) * 100
    : 0

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {state.isRetrying ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              ) : (
                <div className="rounded-full h-5 w-5 bg-green-500"></div>
              )}
              <div>
                <div className="font-semibold text-gray-900">
                  {state.isRetrying ? 'Повторная попытка...' : 'Статус: Готов'}
                </div>
                <div className="text-sm text-gray-600">
                  Попытка {state.currentAttempt}/{maxRetries}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${progressPercentage >= 100 ? 'text-red-600' : 'text-gray-600'}`}>
                {Math.round(progressPercentage)}%
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {state.isRetrying && timeUntilNextRetry !== null && timeUntilNextRetry > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Следующая попытка через: </span>
                <span className="text-blue-600 font-semibold">
                  {formatDuration(timeUntilNextRetry)}
                </span>
              </div>
            </div>
          )}

          {progressPercentage >= 100 && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-sm text-red-700">
                <span className="font-medium">Достигнуто максимальное количество попыток!</span>
              </div>
            </div>
          )}

          {state.lastError && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-700">
                <span className="font-medium">Последняя ошибка:</span>
                <div className="mt-1 text-xs text-orange-600 break-words">
                  {state.lastError.message}
                </div>
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200">
            <div className="p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Детальная статистика</h4>
                <div className="flex gap-2">
                  {onClearLogs && (
                    <button
                      onClick={onClearLogs}
                      className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                    >
                      Очистить логи
                    </button>
                  )}
                  {onAbort && state.isRetrying && (
                    <button
                      onClick={onAbort}
                      className="px-3 py-1 text-sm bg-red-500 text-white hover:bg-red-600 rounded transition-colors"
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Всего попыток:</span>
                  <span className="font-medium text-gray-900">{state.totalRetries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Текущая попытка:</span>
                  <span className="font-medium text-gray-900">{state.currentAttempt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Оставшиеся попытки:</span>
                  <span className={`font-medium ${(retryHandler?.getRemainingRetries() ?? 0) <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                    {retryHandler?.getRemainingRetries() ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Время выполнения:</span>
                  <span className="font-medium text-gray-900">
                    {formatDuration(Date.now() - state.startTime.getTime())}
                  </span>
                </div>
              </div>

              {showLogs && logs.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">История попыток</h5>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {logs.slice(-10).reverse().map((log, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border ${log.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${log.success ? 'text-green-700' : 'text-red-700'}`}>
                              {log.success ? '✓' : '✗'}
                            </span>
                            <span className="text-gray-900">Попытка {log.attempt}</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Длительность: {formatDuration(log.duration)}
                        </div>
                        {log.error && (
                          <div className="text-xs text-red-700 mt-1 break-words">
                            Ошибка: {log.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}