
import React, { useEffect, useState, useRef } from 'react'
import { Terminal, Brain, Search, CheckCircle, AlertTriangle, Activity } from 'lucide-react'

interface LogEntry {
    timestamp: string
    type: 'info' | 'search' | 'ai' | 'error' | 'success'
    message: string
}

interface ThinkingTerminalProps {
    jobId: string
    status: string
    className?: string
}

export default function ThinkingTerminal({ jobId, status, className = '' }: ThinkingTerminalProps) {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)
    const [polling, setPolling] = useState(true)

    useEffect(() => {
        let intervalId: NodeJS.Timeout

        const fetchLogs = async () => {
            try {
                const res = await fetch(`/api/research/jobs/${jobId}/logs`)
                if (res.ok) {
                    const data = await res.json()
                    setLogs(data)
                }
            } catch (e) {
                console.error(e)
            }
        }

        if (polling) {
            fetchLogs()
            intervalId = setInterval(fetchLogs, 2000)
        }

        return () => clearInterval(intervalId)
    }, [jobId, polling])

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    // Stop polling if completed
    useEffect(() => {
        if (status === 'completed' || status === 'failed') {
            setPolling(false)
        }
    }, [status])

    const getIcon = (type: string) => {
        switch (type) {
            case 'ai': return <Brain className="w-4 h-4 text-purple-400" />
            case 'search': return <Search className="w-4 h-4 text-blue-400" />
            case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />
            case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />
            default: return <Activity className="w-4 h-4 text-gray-400" />
        }
    }

    const getColor = (type: string) => {
        switch (type) {
            case 'ai': return 'text-purple-300'
            case 'search': return 'text-blue-300'
            case 'success': return 'text-green-300'
            case 'error': return 'text-red-300'
            default: return 'text-gray-300'
        }
    }

    return (
        <div className={`rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl ${className}`}>
            {/* Header */}
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-mono text-slate-400">AGENT_PROCESS_LOGS</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
            </div>

            {/* Logs Area */}
            <div
                ref={scrollRef}
                className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar bg-slate-950/50 backdrop-blur-sm"
            >
                {logs.length === 0 && (
                    <div className="text-slate-600 italic text-center mt-10">Waiting for process start...</div>
                )}

                {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="shrink-0 pt-0.5 opacity-70">
                            {getIcon(log.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-slate-600 mr-2">
                                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                            </span>
                            <span className={`${getColor(log.type)} break-words`}>
                                {log.message}
                            </span>
                        </div>
                    </div>
                ))}

                {status !== 'completed' && status !== 'failed' && (
                    <div className="flex items-center gap-2 text-slate-500 animate-pulse mt-4">
                        <span className="w-1.5 h-4 bg-slate-500 block" />
                        Processing...
                    </div>
                )}
            </div>
        </div>
    )
}
