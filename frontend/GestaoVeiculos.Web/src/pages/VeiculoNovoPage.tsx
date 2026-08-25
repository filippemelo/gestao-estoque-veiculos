import { Link } from 'react-router-dom'

import { Button } from '@/components/ui'
import { FormularioNovoVeiculo } from '@/features/veiculos/FormularioNovoVeiculo'

export function VeiculoNovoPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Novo veículo
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Preencha os dados abaixo para cadastrar.
          </p>
        </div>
        <Link to="/veiculos">
          <Button variant="ghost">
            <IconeVoltar />
            Voltar
          </Button>
        </Link>
      </header>

      <FormularioNovoVeiculo />
    </div>
  )
}

function IconeVoltar() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M12.7 4.3a1 1 0 010 1.4L8.4 10l4.3 4.3a1 1 0 11-1.4 1.4l-5-5a1 1 0 010-1.4l5-5a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}
