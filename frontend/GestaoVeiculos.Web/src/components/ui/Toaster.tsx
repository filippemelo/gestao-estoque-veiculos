import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/cn'

import type { ShowToastInput, ToasterCtx, ToastVariant } from './toaster-context'
import { ToasterContext } from './toaster-context'

type Toast = {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  durationMs: number
}

let counter = 0
const nextId = () => {
  counter += 1
  return `t${counter}`
}

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((input: ShowToastInput) => {
    const toast: Toast = {
      id: nextId(),
      variant: input.variant,
      title: input.title,
      description: input.description,
      durationMs: input.durationMs ?? 5000,
    }
    setToasts((prev) => [...prev, toast])
  }, [])

  const value = useMemo<ToasterCtx>(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToasterContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4"
        >
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body,
      )}
    </ToasterContext.Provider>
  )
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  error: 'border-danger-500 bg-danger-50 text-danger-700',
  info: 'border-primary-300 bg-primary-50 text-primary-900',
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, toast.durationMs)
    return () => window.clearTimeout(id)
  }, [toast.durationMs, onDismiss])

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto w-full max-w-md rounded-md border px-3 py-2 shadow-md',
        'motion-safe:animate-[fade-in_150ms_ease-out]',
        variantStyles[toast.variant],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.description ? (
            <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar aviso"
          className="rounded p-1 text-current opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
            <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" />
        </svg>
        </button>
      </div>
    </div>
  )
}
