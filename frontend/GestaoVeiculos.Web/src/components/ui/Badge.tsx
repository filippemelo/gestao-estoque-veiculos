import type { ReactNode } from 'react'

import type { Situacao } from '@/api/types'
import { cn } from '@/lib/cn'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-danger-50 text-danger-700 ring-danger-100',
  info: 'bg-primary-50 text-primary-800 ring-primary-100',
}

type BadgeProps = {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// Badge dedicado à situação do veículo — cores fixas em toda a aplicação.
type BadgeSituacaoProps = { situacao: Situacao | string; className?: string }

export function BadgeSituacao({ situacao, className }: BadgeSituacaoProps) {
  const style = mapaSituacao[situacao] ?? mapaSituacao.__desconhecido
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        style,
        className,
      )}
    >
      {situacao}
    </span>
  )
}

const mapaSituacao: Record<string, string> = {
  Disponível:
    'bg-[color:var(--color-situacao-disponivel-bg)] text-[color:var(--color-situacao-disponivel-text)] ring-[color:var(--color-situacao-disponivel-ring)]',
  Reservado:
    'bg-[color:var(--color-situacao-reservado-bg)] text-[color:var(--color-situacao-reservado-text)] ring-[color:var(--color-situacao-reservado-ring)]',
  Vendido:
    'bg-[color:var(--color-situacao-vendido-bg)] text-[color:var(--color-situacao-vendido-text)] ring-[color:var(--color-situacao-vendido-ring)]',
  __desconhecido: 'bg-slate-100 text-slate-700 ring-slate-200',
}
