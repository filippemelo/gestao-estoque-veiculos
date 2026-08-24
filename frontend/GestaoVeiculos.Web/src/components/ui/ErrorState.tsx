import type { ReactNode } from 'react'

import { Button } from './Button'

type ErrorStateProps = {
  title?: string
  description?: ReactNode
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  title = 'Não foi possível carregar as informações.',
  description,
  onRetry,
  retryLabel = 'Tentar novamente',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700"
    >
      <p className="font-medium">{title}</p>
      {description ? <p className="text-danger-700/90">{description}</p> : null}
      {onRetry ? (
        <div className="mt-1">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
