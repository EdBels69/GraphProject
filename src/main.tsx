import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

(window as any).__MAIN_TSX_EVALUATED__ = true

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('❌ Root element not found')
  document.body.innerHTML = '<h1 style="color: red; font-size: 30px; padding: 20px;">ERROR: Root element not found!</h1>'
  throw new Error('Root element not found')
}

console.log('✅ 1. Root element found')

rootElement.innerHTML = ''

console.log('✅ 2. About to create React root...')

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('✅ 3. React rendered successfully')

setTimeout(() => {
  console.log('✅ 4. Force re-render completed')
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}, 100)
