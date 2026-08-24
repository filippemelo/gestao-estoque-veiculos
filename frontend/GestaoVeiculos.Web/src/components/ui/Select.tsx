import type { Ref, SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean
  ref?: Ref<HTMLSelectElement>
}

export function Select({ invalid, className, children, ref, ...rest }: SelectProps) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full rounded-md border bg-white px-3 text-sm text-slate-900 h-10',
        'motion-safe:transition motion-safe:duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
        'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed',
        invalid ? 'border-danger-500' : 'border-border-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  )
}
