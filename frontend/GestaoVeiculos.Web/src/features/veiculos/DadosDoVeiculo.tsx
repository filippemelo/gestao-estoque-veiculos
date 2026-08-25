import type { ReactNode } from 'react'

import type { Veiculo } from '@/api/types'
import { BadgeSituacao } from '@/components/ui'
import { formatarMoedaBRL, formatarPlaca, formatarQuilometragem } from '@/lib/format'

type Props = {
  veiculo: Veiculo
}

export function DadosDoVeiculo({ veiculo }: Props) {
  return (
    <section
      aria-label="Dados do veículo"
      className="rounded-lg border border-border-subtle bg-white shadow-sm ring-1 ring-slate-900/[0.03]"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Placa</p>
          <p className="num text-lg font-semibold text-slate-900">{formatarPlaca(veiculo.placa)}</p>
        </div>
        <BadgeSituacao situacao={veiculo.situacao} className="text-sm" />
      </header>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        <Item label="Marca">{veiculo.marca}</Item>
        <Item label="Modelo">{veiculo.modelo}</Item>
        <Item label="Ano">
          <span className="num">{veiculo.ano}</span>
        </Item>
        <Item label="Cor">{veiculo.cor}</Item>
        <Item label="Tipo">{veiculo.tipo}</Item>
        <Item label="Preço">
          <span className="num font-medium text-slate-900">
            {formatarMoedaBRL(veiculo.preco)}
          </span>
        </Item>
        <Item label="Quilometragem">
          <span className="num">{formatarQuilometragem(veiculo.quilometragem)}</span>
        </Item>
      </dl>
    </section>
  )
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800">{children}</dd>
    </div>
  )
}
