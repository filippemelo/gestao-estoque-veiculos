import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-subtle bg-white shadow-sm ring-1 ring-slate-900/[0.03]">
      <table
        className={cn('w-full border-collapse text-sm text-slate-800', className)}
        {...rest}
      />
    </div>
  )
}

export function THead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'border-b border-border-strong bg-slate-50 text-xs uppercase tracking-wide text-slate-600',
        className,
      )}
      {...rest}
    />
  )
}

export function TBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-border-subtle', className)} {...rest} />
}

export function TR({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        // Zebra visível por padrão + hover no acento primary (identidade teal).
        'even:bg-slate-50 motion-safe:transition-colors hover:bg-primary-50',
        className,
      )}
      {...rest}
    />
  )
}

type CellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  numeric?: boolean
}

export function TH({ className, numeric, ...rest }: CellProps) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 font-medium',
        // Mutuamente exclusivo — evita dependência da ordem no CSS de saída.
        numeric ? 'text-right num' : 'text-left',
        className,
      )}
      {...rest}
    />
  )
}

export function TD({
  className,
  numeric,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn('px-4 py-3 align-middle', numeric ? 'text-right num' : '', className)}
      {...rest}
    />
  )
}
