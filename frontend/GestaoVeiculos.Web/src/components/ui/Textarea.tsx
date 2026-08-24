import type { Ref, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ invalid, className, ref, rows = 3, ...rest }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
        'placeholder:text-slate-400',
        'motion-safe:transition motion-safe:duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500',
        'disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed',
        'read-only:bg-slate-50 read-only:text-slate-700',
        'resize-y',
        invalid ? 'border-danger-500' : 'border-border-strong',
        className,
      )}
      {...rest}
    />
  )
}
