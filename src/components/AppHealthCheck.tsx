import { useEffect, useState } from 'react'

/**
 * Lightweight health check - only shows in development mode
 * and auto-hides after 3 seconds
 */
export default function AppHealthCheck() {
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Only show in development
    if (import.meta.env.PROD) {
      return
    }

    setVisible(true)

    // Simple check - just wait for DOM to be ready
    const checkReady = () => {
      const hasContent = document.body.innerHTML.length > 1000
      if (hasContent) {
        setReady(true)
        // Auto-hide after showing "ready" for 1 second
        setTimeout(() => setVisible(false), 1000)
      }
    }

    // Check immediately and then every 500ms
    checkReady()
    const interval = setInterval(checkReady, 500)

    // Force hide after 5 seconds regardless
    const timeout = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 12,
      left: 12,
      zIndex: 9999,
      background: ready ? '#dcfce7' : '#fff',
      border: `1px solid ${ready ? '#86efac' : '#e2e8f0'}`,
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      fontFamily: 'monospace',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}>
      {ready ? (
        <span style={{ color: '#166534' }}>✅ Ready</span>
      ) : (
        <span style={{ color: '#64748b' }}>⏳ Loading...</span>
      )}
    </div>
  )
}
