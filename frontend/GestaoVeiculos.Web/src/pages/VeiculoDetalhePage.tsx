import { Link, useNavigate, useParams } from 'react-router-dom'

import { ApiError } from '@/api/http'
import { Button, ErrorState, Skeleton, useToast } from '@/components/ui'
import { HistoricoProprietarios } from '@/features/proprietarios/HistoricoProprietarios'
import { useProprietariosDoVeiculoQuery } from '@/features/proprietarios/hooks/useProprietariosDoVeiculoQuery'
import { DadosDoVeiculo } from '@/features/veiculos/DadosDoVeiculo'
import { useVeiculoDetalheQuery } from '@/features/veiculos/hooks/useVeiculoDetalheQuery'

export function VeiculoDetalhePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { id: idParam } = useParams<{ id: string }>()
  const id = Number(idParam)
  const idValido = Number.isFinite(id) && id > 0

  const veiculoQuery = useVeiculoDetalheQuery(id, idValido)

  // Se a resposta do detalhe já traz `proprietarios`, usamos direto.
  // Caso contrário, buscamos separadamente em /proprietarios/veiculo/{id}.
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

  function avisoEmConstrucao(mensagem: string) {
    toast.show({
      variant: 'info',
      title: 'Ação disponível na próxima etapa',
      description: mensagem,
    })
  }

  // -------------------- Estados de topo --------------------
  if (!idValido) return <NaoEncontrado navigate={navigate} descricao="Identificador inválido." />

  if (veiculoQuery.isError) {
    const err = veiculoQuery.error
    if (err instanceof ApiError && err.status === 404) {
      return <NaoEncontrado navigate={navigate} descricao={err.message} />
    }
    return (
      <div className="space-y-4">
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
      <div className="space-y-4">
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

  // -------------------- Sucesso --------------------
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
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
          <Link to={`/veiculos/${veiculo.id}/editar`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button
            variant="danger"
            onClick={() =>
              avisoEmConstrucao('A exclusão do veículo será implementada em breve.')
            }
          >
            Excluir
          </Button>
        </div>
      </header>

      <DadosDoVeiculo veiculo={veiculo} />

      <HistoricoProprietarios
        proprietarios={proprietarios}
        carregando={carregandoProprietarios}
        erro={erroProprietarios}
        onTentarNovamente={() => proprietariosQuery.refetch()}
        temProprietarioAtual={temProprietarioAtual}
        onAdicionar={() =>
          avisoEmConstrucao('O cadastro de novo proprietário será implementado em breve.')
        }
      />
    </div>
  )
}

// -------------------- Auxiliares --------------------
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
        <h1 className="text-xl font-semibold text-slate-900">Detalhe do veículo</h1>
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
    <div className="space-y-4">
      <CabecalhoErro />
      <div className="flex flex-col items-start gap-3 rounded-md border border-border-subtle bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Erro 404</p>
        <h2 className="text-lg font-semibold text-slate-900">Veículo não encontrado</h2>
        <p className="text-sm text-slate-600">{descricao}</p>
        <Button onClick={() => navigate('/veiculos')}>Ir para veículos</Button>
      </div>
    </div>
  )
}
