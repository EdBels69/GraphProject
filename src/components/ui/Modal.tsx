import { useEffect } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-void/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={twMerge(
          'relative glass-panel-heavy rounded-2xl w-full mx-4 overflow-hidden animate-fade-in',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-ash/10 bg-void">
            <h2 className="text-lg font-display font-bold text-steel tracking-widest uppercase mb-0">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-steel/5 rounded-lg transition-colors text-steel-dim hover:text-steel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-steel">
          {children}
        </div>
      </div>
    </div>
  )
}
