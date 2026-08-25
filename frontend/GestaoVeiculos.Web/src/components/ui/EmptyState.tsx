import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type EmptyStateProps = {
  title: string
  description?: ReactNode
  action?: ReactNode
  // Reduz o padding vertical para uso dentro de cards (histórico embutido, etc.).
  compact?: boolean
}

export function EmptyState({ title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-white px-6 text-center',
        compact ? 'py-6' : 'py-10',
      )}
    >
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description ? <p className="max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
