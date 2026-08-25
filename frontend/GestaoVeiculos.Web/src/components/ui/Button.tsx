import type { ButtonHTMLAttributes, Ref } from 'react'

import { cn } from '@/lib/cn'

import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900 ' +
    'focus-visible:ring-primary-500 disabled:bg-slate-300 disabled:text-slate-500',
  secondary:
    'bg-white text-slate-800 border border-border-strong hover:bg-slate-50 ' +
    'active:bg-slate-100 focus-visible:ring-primary-500 ' +
    'disabled:bg-slate-100 disabled:text-slate-400 disabled:border-border-subtle',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 ' +
    'focus-visible:ring-danger-500 disabled:bg-slate-300 disabled:text-slate-500',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 ' +
    'focus-visible:ring-primary-500 disabled:text-slate-400',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium',
        'motion-safe:transition-colors motion-safe:duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner size="sm" className="border-white/40 border-t-white" /> : null}
      {children}
    </button>
  )
}
