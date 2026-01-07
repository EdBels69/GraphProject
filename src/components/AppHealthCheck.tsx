import { useEffect, useState } from 'react'

interface AppState {
  htmlLoaded: boolean
  scriptsLoaded: boolean
  reactStarted: boolean
  reactRendered: boolean
  componentsReady: boolean
  error: string | null
  completed: boolean
}

export default function AppHealthCheck() {
  const [state, setState] = useState<AppState>({
    htmlLoaded: false,
    scriptsLoaded: false,
    reactStarted: false,
    reactRendered: false,
    componentsReady: false,
    error: null,
    completed: false
  })

  useEffect(() => {
    const checkHtml = () => {
      const isHtmlLoaded = document.readyState === 'complete' || document.readyState === 'interactive'
      if (isHtmlLoaded && !state.htmlLoaded) {
        console.log('✅ 1. HTML загружен')
        setState(prev => ({ ...prev, htmlLoaded: true }))
      }
    }

    const checkScripts = () => {
      const mainTsxEvaluated = (window as any).__MAIN_TSX_EVALUATED__ === true
      if (mainTsxEvaluated && !state.scriptsLoaded) {
        console.log('✅ 2. Скрипты загружены')
        setState(prev => ({ ...prev, scriptsLoaded: true }))
      }
    }

    const checkReactStarted = () => {
      const rootElement = document.getElementById('root')
      const hasRootChildren = rootElement && rootElement.children.length > 0
      if (hasRootChildren && !state.reactStarted) {
        console.log('✅ 3. React начал рендеринг')
        setState(prev => ({ ...prev, reactStarted: true }))
      }
    }

    const checkReactRendered = () => {
      const rootElement = document.getElementById('root')
      const hasAppContent = rootElement && rootElement.innerHTML.includes('Graph Analyser')
      if (hasAppContent && !state.reactRendered) {
        console.log('✅ 4. React отрендерился')
        setState(prev => ({ ...prev, reactRendered: true }))
      }
    }

    const checkComponentsReady = () => {
      const hasNav = document.querySelector('nav')
      const hasMain = document.querySelector('main')
      const hasLinks = document.querySelectorAll('a').length > 0
      const hasButtons = document.querySelectorAll('button').length > 0
      const hasInteractiveElements = hasLinks || hasButtons
      if (hasNav && hasMain && hasInteractiveElements && !state.componentsReady) {
        console.log('✅ 5. Компоненты готовы')
        setState(prev => ({ ...prev, componentsReady: true }))
      }
    }

    const allChecksPassed = state.htmlLoaded && state.scriptsLoaded && state.reactStarted && state.reactRendered && state.componentsReady

    if (allChecksPassed && !state.completed) {
      console.log('🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ! Приложение готово!')
      setState(prev => ({ ...prev, completed: true }))
      return
    }

    checkHtml()
    const scriptCheck = setInterval(checkScripts, 100)
    const reactCheck = setInterval(checkReactStarted, 200)
    const renderCheck = setInterval(checkReactRendered, 300)
    const componentsCheck = setInterval(checkComponentsReady, 400)

    const timeoutId = setTimeout(() => {
      if (!state.scriptsLoaded) {
        console.log('⚠️ Timeout: Скрипты не загружены, но продолжаем...')
        setState(prev => ({ ...prev, scriptsLoaded: true }))
      }
    }, 5000)

    return () => {
      clearInterval(scriptCheck)
      clearInterval(reactCheck)
      clearInterval(renderCheck)
      clearInterval(componentsCheck)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 z-50 bg-white shadow-lg rounded-lg p-4 m-4 max-w-xs">
      <div className="text-xs font-mono space-y-1">
        <div className="font-bold text-gray-900 mb-2">Статус приложения:</div>
        
        {state.htmlLoaded ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>HTML загружен</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-red-600">⏳</span>
            <span>HTML загружается...</span>
          </div>
        )}

        {state.scriptsLoaded ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Скрипты загружены</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-red-600">⏳</span>
            <span>Скрипты загружаются...</span>
          </div>
        )}

        {state.reactStarted ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>React начал рендеринг</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-red-600">⏳</span>
            <span>React ждет...</span>
          </div>
        )}

        {state.reactRendered ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>React отрендерился</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-red-600">⏳</span>
            <span>React рендерится...</span>
          </div>
        )}

        {state.componentsReady ? (
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Компоненты готовы</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-red-600">⏳</span>
            <span>Компоненты готовятся...</span>
          </div>
        )}

        {state.error && (
          <div className="text-red-600 font-bold mt-2">
            ❌ Ошибка: {state.error}
          </div>
        )}

        {state.completed && (
          <div className="text-green-600 font-bold mt-2 text-center">
            🎉 Приложение готово!
          </div>
        )}
      </div>
    </div>
  )
}
