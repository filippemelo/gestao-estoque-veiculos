import { Button } from '@/components/ui'

type Props = {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function VeiculosPager({ page, totalPages, total, pageSize, onPageChange }: Props) {
  if (total === 0) return null

  const inicio = (page - 1) * pageSize + 1
  const fim = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-col items-start justify-between gap-2 text-sm text-slate-600 sm:flex-row sm:items-center"
    >
      <p>
        Mostrando <span className="num text-slate-900">{inicio}</span>–
        <span className="num text-slate-900">{fim}</span> de{' '}
        <span className="num text-slate-900">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="num rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </nav>
  )
}
