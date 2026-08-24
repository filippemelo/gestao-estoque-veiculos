import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-strong bg-white px-6 py-10 text-center">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description ? <p className="max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
