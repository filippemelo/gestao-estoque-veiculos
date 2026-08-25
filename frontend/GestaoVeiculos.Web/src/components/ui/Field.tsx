import type { ReactNode } from 'react'
import { useId } from 'react'

import { cn } from '@/lib/cn'

type FieldProps = {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: ReactNode
  error?: ReactNode
  className?: string
  // children pode ser um input já pronto ou uma função que recebe id/aria-*.
  children: ReactNode | ((props: FieldChildrenProps) => ReactNode)
}

export type FieldChildrenProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

export function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  const generatedId = useId()
  const id = htmlFor ?? generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  const childProps: FieldChildrenProps = {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  }

  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required ? <span className="ml-0.5 text-danger-600">*</span> : null}
      </label>
      {typeof children === 'function' ? children(childProps) : children}
      {/* Slot com altura reservada — Fields lado a lado ficam alinhados
          verticalmente mesmo quando só um tem hint ou erro. */}
      <p
        id={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'text-xs',
          error ? 'text-danger-700' : 'text-slate-500',
        )}
      >
        {error ?? hint ?? ' '}
      </p>
    </div>
  )
}
