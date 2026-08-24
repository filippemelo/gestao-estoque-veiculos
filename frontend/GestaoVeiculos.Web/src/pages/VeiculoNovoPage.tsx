import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'

export function VeiculoNovoPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Novo veículo</h1>
          <p className="text-sm text-slate-600">Placeholder — Etapa 2. Formulário chega na Etapa 3.</p>
        </div>
        <Link to="/veiculos">
          <Button variant="secondary">Voltar</Button>
        </Link>
      </header>

      <section className="rounded-md border border-dashed border-border-strong bg-white p-6 text-sm text-slate-500">
        Área do formulário de cadastro.
      </section>
    </div>
  )
}
