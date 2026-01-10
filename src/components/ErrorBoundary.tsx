import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, ChevronDown, Terminal } from 'lucide-react'
import { Button } from './ui/Button'

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
    console.error('CRITICAL_SYSTEM_FAULT:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-8 animate-fade-in">
          <div className="max-w-2xl w-full glass-panel-heavy p-12 rounded-3xl border border-red-500/20 shadow-glow-plasma/5 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-glow-plasma/10">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-display font-bold text-white tracking-tighter uppercase mb-4">
              SYSTEM_INTEGRITY_COMPROMISED
            </h1>

            <p className="text-steel/50 mb-10 font-mono text-xs uppercase tracking-widest leading-relaxed">
              An unexpected neural collision has occurred.
              The current session protocol has been terminated to prevent data leakage.
            </p>

            {this.state.error && (
              <div className="mb-10 text-left">
                <details className="group">
                  <summary className="cursor-pointer flex items-center justify-between px-6 py-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                    <span className="flex items-center gap-3 text-[10px] font-display font-bold text-steel/40 uppercase tracking-widest">
                      <Terminal className="w-4 h-4 text-red-400" />
                      FAULT_DETAILS_STREAM
                    </span>
                    <ChevronDown className="w-4 h-4 text-steel/20 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-4 p-6 bg-void/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                    <pre className="text-[10px] font-mono text-red-400/80 overflow-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                      {this.state.error.stack || this.state.error.toString()}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            <Button
              size="lg"
              variant="primary"
              onClick={() => window.location.reload()}
              className="w-full shadow-glow-acid/20"
            >
              <RefreshCw className="w-5 h-5 mr-3" />
              REBOOT_SESSION
            </Button>

            <p className="mt-8 text-[9px] font-mono text-steel/20 uppercase tracking-tighter">
              Session ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} // Fault Code: 0x882_COLLISION
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
