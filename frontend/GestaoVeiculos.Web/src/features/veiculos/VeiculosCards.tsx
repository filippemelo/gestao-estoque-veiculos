import { Link } from 'react-router-dom'

import type { Veiculo } from '@/api/types'
import { BadgeSituacao, Skeleton } from '@/components/ui'
import { formatarMoedaBRL, formatarPlaca, formatarQuilometragem } from '@/lib/format'

type Props = {
  veiculos: Veiculo[]
  carregando: boolean
}

// Alternativa mobile da VeiculosTable. Layout mais denso em card, sem colunas.
export function VeiculosCards({ veiculos, carregando }: Props) {
  return (
    <ul className="grid gap-2 md:hidden">
      {carregando
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : veiculos.map((v) => (
            <li
              key={v.id}
              className="rounded-md border border-border-subtle bg-white p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {v.marca} <span className="font-normal text-slate-700">{v.modelo}</span>
                  </p>
                  <p className="num text-xs text-slate-500">{formatarPlaca(v.placa)}</p>
                </div>
                <BadgeSituacao situacao={v.situacao} />
              </div>

              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-700">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Ano</dt>
                  <dd className="num">{v.ano}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Cor</dt>
                  <dd>{v.cor}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tipo</dt>
                  <dd>{v.tipo}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Km</dt>
                  <dd className="num">{formatarQuilometragem(v.quilometragem)}</dd>
                </div>
                <div className="col-span-2 flex justify-between border-t border-border-subtle pt-1">
                  <dt className="text-slate-500">Preço</dt>
                  <dd className="num font-medium text-slate-900">
                    {formatarMoedaBRL(v.preco)}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex justify-end gap-1 border-t border-border-subtle pt-2">
                <Link
                  to={`/veiculos/${v.id}`}
                  className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  Ver
                </Link>
                <Link
                  to={`/veiculos/${v.id}/editar`}
                  className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
    </ul>
  )
}

function SkeletonCard() {
  return (
    <li className="rounded-md border border-border-subtle bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-1 h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </li>
  )
}
