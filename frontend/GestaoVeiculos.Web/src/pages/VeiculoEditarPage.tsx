import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui'

export function VeiculoEditarPage() {
  const { id } = useParams()
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Editar veículo <span className="num text-slate-500">#{id}</span>
          </h1>
          <p className="text-sm text-slate-600">Placeholder — Etapa 2.</p>
        </div>
        <Link to={`/veiculos/${id}`}>
          <Button variant="secondary">Voltar ao detalhe</Button>
        </Link>
      </header>

      <section className="rounded-md border border-dashed border-border-strong bg-white p-6 text-sm text-slate-500">
        Área do formulário de edição (placa em somente leitura).
      </section>
    </div>
  )
}
