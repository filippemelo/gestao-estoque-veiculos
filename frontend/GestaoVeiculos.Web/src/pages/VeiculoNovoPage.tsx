import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'
import { FormularioNovoVeiculo } from '@/features/veiculos/FormularioNovoVeiculo'

export function VeiculoNovoPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Novo veículo</h1>
          <p className="text-sm text-slate-600">Preencha os dados abaixo para cadastrar.</p>
        </div>
        <Link to="/veiculos">
          <Button variant="ghost">Voltar</Button>
        </Link>
      </header>

      <FormularioNovoVeiculo />
    </div>
  )
}
