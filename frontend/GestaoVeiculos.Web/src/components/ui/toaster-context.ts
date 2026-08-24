import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export type ShowToastInput = {
  variant: ToastVariant
  title: string
  description?: string
  durationMs?: number
}

export type ToasterCtx = {
  show: (toast: ShowToastInput) => void
  dismiss: (id: string) => void
}

export const ToasterContext = createContext<ToasterCtx | null>(null)
