import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-900 mb-4">
              Произошла ошибка
            </h1>
            <p className="text-red-700 mb-6">
              К сожалению, при работе приложения возникла непредвиденная ошибка.
              Пожалуйста, попробуйте перезагрузить страницу.
            </p>
            {this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-red-800 font-semibold mb-2">
                  Подробности ошибки
                </summary>
                <pre className="bg-red-100 p-4 rounded-lg text-sm overflow-auto max-h-64 text-red-900">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
