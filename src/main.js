import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Root element not found')
  throw new Error('Root element not found')
}

console.log('Starting React app...')
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
console.log('React app rendered successfully')
