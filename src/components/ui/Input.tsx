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
        <label className="block text-xs font-display font-bold tracking-widest text-steel-dim uppercase mb-2">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          'w-full bg-white border border-ash/30 rounded-xl px-4 py-3 text-steel placeholder-gray-400 outline-none transition-all font-mono text-sm',
          'focus:border-acid focus:ring-1 focus:ring-acid/20',
          error && 'border-red-500/50 focus:ring-red-500/20',
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
