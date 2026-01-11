import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-steel mb-2">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          'w-full bg-white border border-ash/60 rounded-xl px-5 py-4 text-steel placeholder-gray-400 outline-none transition-all font-body text-base',
          'focus:border-acid focus:ring-4 focus:ring-acid/5',
          error && 'border-red-500/50 focus:ring-red-500/5',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-[10px] font-mono text-red-600 uppercase tracking-tight font-bold">
          {error}
        </p>
      )}
    </div>
  )
}
