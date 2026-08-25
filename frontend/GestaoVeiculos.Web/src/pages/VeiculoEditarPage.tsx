import { Link, useNavigate, useParams } from 'react-router-dom'

import { ApiError } from '@/api/http'
import { Button, ErrorState, Skeleton } from '@/components/ui'
import { FormularioEditarVeiculo } from '@/features/veiculos/FormularioEditarVeiculo'
import { useVeiculoDetalheQuery } from '@/features/veiculos/hooks/useVeiculoDetalheQuery'

export function VeiculoEditarPage() {
  const navigate = useNavigate()
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)
  const idValido = Number.isFinite(id) && id > 0

  const query = useVeiculoDetalheQuery(id, idValido)

  if (!idValido) return <NaoEncontrado descricao="Identificador inválido." navigate={navigate} />

  if (query.isError) {
    const err = query.error
    if (err instanceof ApiError && err.status === 404) {
      return <NaoEncontrado descricao={err.message} navigate={navigate} />
    }
    return (
      <div className="space-y-6">
        <CabecalhoErro />
        <ErrorState
          title="Não foi possível carregar o veículo."
          description={err instanceof Error ? err.message : String(err)}
          onRetry={() => query.refetch()}
        />
      </div>
    )
  }

  if (query.isPending) {
    return (
      <div className="space-y-6">
        <CabecalhoCarregando />
        <div className="rounded-lg border border-border-subtle bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const veiculo = query.data
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Editar veículo
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            <Link to="/veiculos" className="text-primary-700 hover:underline">
              Veículos
            </Link>{' '}
            ·{' '}
            <Link to={`/veiculos/${veiculo.id}`} className="text-primary-700 hover:underline">
              #{veiculo.id}
            </Link>{' '}
            · <span>{veiculo.marca} {veiculo.modelo}</span>
          </p>
        </div>
        <Link to={`/veiculos/${veiculo.id}`}>
          <Button variant="ghost">
            <IconeVoltar />
            Voltar
          </Button>
        </Link>
      </header>

      <FormularioEditarVeiculo veiculoInicial={veiculo} />
    </div>
  )
}

function CabecalhoCarregando() {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-56" />
      </div>
    </header>
  )
}

function CabecalhoErro() {
  return (
    <header className="flex items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Editar veículo</h1>
      <Link to="/veiculos">
        <Button variant="ghost">
          <IconeVoltar />
          Voltar
        </Button>
      </Link>
    </header>
  )
}

function NaoEncontrado({
  descricao,
  navigate,
}: {
  descricao: string
  navigate: ReturnType<typeof useNavigate>
}) {
  return (
    <div className="space-y-6">
      <CabecalhoErro />
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border-subtle bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03]">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Erro 404</p>
        <h2 className="text-lg font-semibold text-slate-900">Veículo não encontrado</h2>
        <p className="text-sm text-slate-600">{descricao}</p>
        <Button onClick={() => navigate('/veiculos')}>Ir para veículos</Button>
      </div>
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
