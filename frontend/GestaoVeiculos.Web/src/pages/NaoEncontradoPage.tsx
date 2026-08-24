import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'

export function NaoEncontradoPage() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-border-subtle bg-white p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Erro 404</p>
      <h1 className="text-2xl font-semibold text-slate-900">Página não encontrada</h1>
      <p className="text-sm text-slate-600">
        O endereço acessado não existe ou foi movido. Volte para a lista de veículos.
      </p>
      <Link to="/veiculos">
        <Button>Ir para veículos</Button>
      </Link>
    </div>
  )
}
