import type { InputHTMLAttributes, Ref } from 'react'

import { cn } from '@/lib/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean
  numeric?: boolean
  ref?: Ref<HTMLInputElement>
}

export function Input({ invalid, numeric, className, ref, ...rest }: InputProps) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full rounded-md border bg-white px-3 text-sm text-slate-900 h-10',
        'placeholder:text-slate-400',
        'motion-safe:transition motion-safe:duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
        'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed',
        'read-only:bg-slate-50 read-only:text-slate-700',
        invalid ? 'border-danger-500' : 'border-border-strong',
        numeric ? 'num text-right' : '',
        className,
      )}
      {...rest}
    />
  )
}
