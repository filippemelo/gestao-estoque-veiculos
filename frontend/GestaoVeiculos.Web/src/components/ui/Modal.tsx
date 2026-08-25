import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/cn'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // O <dialog> nativo dispara 'close' quando o usuário aperta ESC.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handler = () => onClose()
    dialog.addEventListener('close', handler)
    return () => dialog.removeEventListener('close', handler)
  }, [onClose])

  // Clique fora (no backdrop) fecha o modal.
  function onBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) onClose()
  }

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      aria-labelledby="modal-title"
      className={cn(
        // `m-auto` restaura a centralização nativa do <dialog> que o
        // Preflight do Tailwind v4 zera com `* { margin: 0 }`.
        'w-full m-auto rounded-lg border border-border-subtle bg-white p-0 shadow-xl backdrop:bg-slate-900/40',
        sizes[size],
      )}
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 id="modal-title" className="text-base font-semibold text-slate-900">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="rounded p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {/* X simples em SVG para evitar dep de ícones. */}
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z" />
          </svg>
        </button>
      </div>
      <div className="px-4 py-4 text-sm text-slate-800">{children}</div>
      {footer ? (
        <div className="flex justify-end gap-2 border-t border-border-subtle bg-slate-50 px-4 py-3">
          {footer}
        </div>
      ) : null}
    </dialog>
  )
}
