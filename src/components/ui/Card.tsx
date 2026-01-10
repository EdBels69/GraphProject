import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  variant?: 'glass' | 'default'
}

export function Card({ children, className, hover = false, onClick, variant = 'default' }: CardProps) {
  return (
    <div
      className={twMerge(
        'glass-panel rounded-xl overflow-hidden',
        hover && 'hover:border-acid/30 transition-all duration-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function CardHeader({ children, className, onClick }: CardHeaderProps) {
  return (
    <div
      className={twMerge('p-6 border-b border-ash/10 bg-void', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return (
    <div className={twMerge(clsx('p-6', className))}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={twMerge('p-6 border-t border-ash/10 bg-void', className)}>
      {children}
    </div>
  )
}
