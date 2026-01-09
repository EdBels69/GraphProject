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
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-500',
        text: 'text-green-800'
    },
    error: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-500',
        text: 'text-red-800'
    },
    warning: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-500',
        text: 'text-yellow-800'
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-500',
        text: 'text-blue-800'
    }
}

function ToastItem({ toast }: { toast: ToastType }) {
    const { removeToast } = useToast()
    const style = styles[toast.type]
    const Icon = icons[toast.type]

    return (
        <div
            className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${style.bg} ${style.border} animate-slide-in`}
            role="alert"
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${style.icon}`} />
            <p className={`text-sm font-medium flex-1 ${style.text}`}>{toast.message}</p>
            <button
                onClick={() => removeToast(toast.id)}
                className={`p-1 rounded hover:bg-white/50 transition-colors ${style.text}`}
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
