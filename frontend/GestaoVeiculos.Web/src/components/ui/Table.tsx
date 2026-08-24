import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export function Table({ className, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-md border border-border-subtle bg-white">
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
        'bg-slate-50 text-xs uppercase tracking-wide text-slate-600',
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
      className={cn('motion-safe:transition-colors hover:bg-slate-50', className)}
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
        'px-3 py-2 text-left font-medium',
        numeric ? 'text-right num' : '',
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
      className={cn('px-3 py-2 align-middle', numeric ? 'text-right num' : '', className)}
      {...rest}
    />
  )
}
