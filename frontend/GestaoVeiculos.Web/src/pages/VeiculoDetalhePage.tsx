import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ApiError } from '@/api/http'
import { Button, ErrorState, Skeleton } from '@/components/ui'
import { HistoricoProprietarios } from '@/features/proprietarios/HistoricoProprietarios'
import { useProprietariosDoVeiculoQuery } from '@/features/proprietarios/hooks/useProprietariosDoVeiculoQuery'
import { ModalAdicionarProprietario } from '@/features/proprietarios/ModalAdicionarProprietario'
import { AcaoExcluirVeiculo } from '@/features/veiculos/AcaoExcluirVeiculo'
import { DadosDoVeiculo } from '@/features/veiculos/DadosDoVeiculo'
import { useVeiculoDetalheQuery } from '@/features/veiculos/hooks/useVeiculoDetalheQuery'

export function VeiculoDetalhePage() {
  const navigate = useNavigate()
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)
  const idValido = Number.isFinite(id) && id > 0

  const [adicionarAberto, setAdicionarAberto] = useState(false)

  const veiculoQuery = useVeiculoDetalheQuery(id, idValido)

  // Fallback: se o detalhe não trouxer proprietarios embutido, buscamos separado.
  const proprietariosEmbutidos = Array.isArray(veiculoQuery.data?.proprietarios)
    ? veiculoQuery.data.proprietarios
    : undefined
  const precisaFallback =
    idValido && !!veiculoQuery.data && proprietariosEmbutidos === undefined

  const proprietariosQuery = useProprietariosDoVeiculoQuery(id, { enabled: precisaFallback })

  const proprietarios = proprietariosEmbutidos ?? proprietariosQuery.data
  const carregandoProprietarios = precisaFallback && proprietariosQuery.isPending
  const erroProprietarios = precisaFallback ? proprietariosQuery.error : undefined
  const temProprietarioAtual =
    (proprietarios ?? []).some((p) => p.isProprietarioAtual) || false

  if (!idValido) return <NaoEncontrado navigate={navigate} descricao="Identificador inválido." />

  if (veiculoQuery.isError) {
    const err = veiculoQuery.error
    if (err instanceof ApiError && err.status === 404) {
      return <NaoEncontrado navigate={navigate} descricao={err.message} />
    }
    return (
      <div className="space-y-6">
        <CabecalhoErro />
        <ErrorState
          title="Não foi possível carregar o veículo."
          description={err instanceof Error ? err.message : String(err)}
          onRetry={() => veiculoQuery.refetch()}
        />
      </div>
    )
  }

  if (veiculoQuery.isPending) {
    return (
      <div className="space-y-6">
        <CabecalhoCarregando />
        <div className="rounded-md border border-border-subtle bg-white p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const veiculo = veiculoQuery.data

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {veiculo.marca} {veiculo.modelo}
          </h1>
          <p className="text-sm text-slate-500">
            <Link to="/veiculos" className="text-primary-700 hover:underline">
              Veículos
            </Link>{' '}
            · <span className="num">#{veiculo.id}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/veiculos">
            <Button variant="ghost">
              <IconeVoltar />
              Voltar
            </Button>
          </Link>
          <Link to={`/veiculos/${veiculo.id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <AcaoExcluirVeiculo veiculo={veiculo} proprietarios={proprietarios} />
        </div>
      </header>

      <DadosDoVeiculo veiculo={veiculo} />

      <HistoricoProprietarios
        proprietarios={proprietarios}
        carregando={carregandoProprietarios}
        erro={erroProprietarios}
        onTentarNovamente={() => proprietariosQuery.refetch()}
        temProprietarioAtual={temProprietarioAtual}
        onAdicionar={() => setAdicionarAberto(true)}
      />

      <ModalAdicionarProprietario
        aberto={adicionarAberto}
        onFechar={() => setAdicionarAberto(false)}
        veiculoId={veiculo.id}
      />
    </div>
  )
}

function CabecalhoCarregando() {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </header>
  )
}

function CabecalhoErro() {
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Detalhe do veículo</h1>
      </div>
      <Link to="/veiculos">
        <Button variant="ghost">Voltar</Button>
      </Link>
    </header>
  )
}

function NaoEncontrado({
  navigate,
  descricao,
}: {
  navigate: ReturnType<typeof useNavigate>
  descricao: string
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
