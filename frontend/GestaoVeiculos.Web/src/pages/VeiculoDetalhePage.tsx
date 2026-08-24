import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui'

export function VeiculoDetalhePage() {
  const { id } = useParams()
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Detalhe do veículo <span className="num text-slate-500">#{id}</span>
          </h1>
          <p className="text-sm text-slate-600">Placeholder — Etapa 2.</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/veiculos/${id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Link to="/veiculos">
            <Button variant="ghost">Voltar</Button>
          </Link>
        </div>
      </header>

      <section className="rounded-md border border-dashed border-border-strong bg-white p-6 text-sm text-slate-500">
        Área do detalhe (dados do veículo + histórico de proprietários).
      </section>
    </div>
  )
}
