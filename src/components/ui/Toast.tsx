import React from 'react'
import { useToast, Toast as ToastType } from '@/contexts/ToastContext'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
}

const styles = {
    success: {
        bg: 'bg-white',
        border: 'border-acid/20',
        icon: 'text-acid',
        text: 'text-steel'
    },
    error: {
        bg: 'bg-white',
        border: 'border-red-500/20',
        icon: 'text-red-600',
        text: 'text-steel'
    },
    warning: {
        bg: 'bg-white',
        border: 'border-orange-500/20',
        icon: 'text-orange-600',
        text: 'text-steel'
    },
    info: {
        bg: 'bg-white',
        border: 'border-plasma/20',
        icon: 'text-plasma',
        text: 'text-steel'
    }
}

function ToastItem({ toast }: { toast: ToastType }) {
    const { removeToast } = useToast()
    const style = styles[toast.type]
    const Icon = icons[toast.type]

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-xl ${style.bg} ${style.border} animate-slide-in relative overflow-hidden group`}
            role="alert"
        >
            <div className={`absolute inset-y-0 left-0 w-1 ${style.icon} bg-current opacity-50`} />
            <Icon className={`w-5 h-5 flex-shrink-0 ${style.icon} group-hover:scale-110 transition-transform`} />
            <p className={`text-sm font-bold flex-1 ${style.text}`}>{toast.message}</p>
            <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 rounded-lg hover:bg-steel/5 transition-colors text-steel-dim hover:text-steel`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}

export default function ToastContainer() {
    const { toasts } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    )
}
