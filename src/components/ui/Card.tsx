import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-xl shadow-sm border border-gray-200',
          hover && 'hover:shadow-md transition-shadow duration-200 cursor-pointer',
          onClick && 'cursor-pointer',
          className
        )
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
      className={twMerge(clsx('p-6 border-b border-gray-200', className))}
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
    <div className={twMerge(clsx('p-6 border-t border-gray-200', className))}>
      {children}
    </div>
  )
}
