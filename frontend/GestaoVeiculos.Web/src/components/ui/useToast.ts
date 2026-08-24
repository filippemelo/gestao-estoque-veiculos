import { useContext } from 'react'

import type { ToasterCtx } from './toaster-context'
import { ToasterContext } from './toaster-context'

export function useToast(): ToasterCtx {
  const ctx = useContext(ToasterContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToasterProvider>.')
  return ctx
}
