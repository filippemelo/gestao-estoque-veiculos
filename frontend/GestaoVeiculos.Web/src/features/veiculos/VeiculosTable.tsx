import { Link } from 'react-router-dom'

import type { Veiculo } from '@/api/types'
import { BadgeSituacao, Skeleton, Table, TBody, TD, TH, THead, TR } from '@/components/ui'
import { formatarMoedaBRL, formatarPlaca, formatarQuilometragem } from '@/lib/format'

type Props = {
  veiculos: Veiculo[]
  carregando: boolean
}

export function VeiculosTable({ veiculos, carregando }: Props) {
  return (
    <div className="hidden md:block">
      <Table>
        <THead>
          <TR>
            <TH>Placa</TH>
            <TH>Marca</TH>
            <TH>Modelo</TH>
            <TH numeric>Ano</TH>
            <TH>Cor</TH>
            <TH>Tipo</TH>
            <TH numeric>Preço</TH>
            <TH numeric>Km</TH>
            <TH>Situação</TH>
            <TH className="w-32 text-right">Ações</TH>
          </TR>
        </THead>
        <TBody>
          {carregando
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            : veiculos.map((v) => (
                <TR key={v.id}>
                  <TD className="num font-medium text-slate-900">{formatarPlaca(v.placa)}</TD>
                  <TD>{v.marca}</TD>
                  <TD className="text-slate-700">{v.modelo}</TD>
                  <TD numeric>{v.ano}</TD>
                  <TD>{v.cor}</TD>
                  <TD>{v.tipo}</TD>
                  <TD numeric>{formatarMoedaBRL(v.preco)}</TD>
                  <TD numeric>{formatarQuilometragem(v.quilometragem)}</TD>
                  <TD>
                    <BadgeSituacao situacao={v.situacao} />
                  </TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1">
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
                  </TD>
                </TR>
              ))}
        </TBody>
      </Table>
    </div>
  )
}

function SkeletonRow() {
  return (
    <TR>
      <TD>
        <Skeleton className="h-4 w-20" />
      </TD>
      <TD>
        <Skeleton className="h-4 w-24" />
      </TD>
      <TD>
        <Skeleton className="h-4 w-40" />
      </TD>
      <TD numeric>
        <Skeleton className="ml-auto h-4 w-10" />
      </TD>
      <TD>
        <Skeleton className="h-4 w-16" />
      </TD>
      <TD>
        <Skeleton className="h-4 w-12" />
      </TD>
      <TD numeric>
        <Skeleton className="ml-auto h-4 w-24" />
      </TD>
      <TD numeric>
        <Skeleton className="ml-auto h-4 w-16" />
      </TD>
      <TD>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TD>
      <TD className="text-right">
        <Skeleton className="ml-auto h-4 w-16" />
      </TD>
    </TR>
  )
}
