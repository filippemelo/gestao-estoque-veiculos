import { Link } from 'react-router-dom'

import { ApiError } from '@/api/http'
import { Button, EmptyState, ErrorState } from '@/components/ui'
import { useVeiculosFilters } from '@/features/veiculos/hooks/useVeiculosFilters'
import { useVeiculosQuery } from '@/features/veiculos/hooks/useVeiculosQuery'
import { VeiculosCards } from '@/features/veiculos/VeiculosCards'
import { VeiculosFilters } from '@/features/veiculos/VeiculosFilters'
import { VeiculosPager } from '@/features/veiculos/VeiculosPager'
import { VeiculosTable } from '@/features/veiculos/VeiculosTable'

export function VeiculosListaPage() {
  const { filtros, setFiltros, setPage, limpar, temFiltro } = useVeiculosFilters()

  const query = useVeiculosQuery({
    marca: filtros.marca || undefined,
    situacao: filtros.situacao || undefined,
    page: filtros.page,
    pageSize: filtros.pageSize,
  })

  const dados = query.data
  const carregandoInicial = query.isPending
  const items = dados?.items ?? []

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Veículos</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {dados ? (
              <>
                <strong className="num font-semibold text-slate-800">{dados.total}</strong>{' '}
                {dados.total === 1 ? 'veículo cadastrado' : 'veículos cadastrados'}
              </>
            ) : (
              'Carregando…'
            )}
          </p>
        </div>
        <Link to="/veiculos/novo">
          <Button>
            <IconePlus />
            Adicionar veículo
          </Button>
        </Link>
      </header>

      <VeiculosFilters
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onLimpar={limpar}
        temFiltro={temFiltro}
      />

      {renderConteudo()}
    </div>
  )

  function renderConteudo() {
    if (query.isError) {
      const err = query.error
      const detail = err instanceof ApiError ? err.message : String(err)
      return (
        <ErrorState
          title="Não foi possível carregar os veículos."
          description={detail}
          onRetry={() => query.refetch()}
        />
      )
    }

    if (carregandoInicial) {
      return (
        <>
          <VeiculosTable veiculos={[]} carregando />
          <VeiculosCards veiculos={[]} carregando />
        </>
      )
    }

    if (!dados) return null

    // Vazio: distingue "sem cadastro" de "sem resultado com filtro".
    if (items.length === 0) {
      if (temFiltro) {
        return (
          <EmptyState
            title="Nenhum resultado para estes filtros"
            description="Ajuste ou remova os filtros aplicados para ver mais veículos."
            action={
              <Button variant="secondary" onClick={limpar}>
                Limpar filtros
              </Button>
            }
          />
        )
      }
      if (dados.total > 0 && filtros.page > dados.totalPages) {
        // Página fora do intervalo (ex.: refresh depois de exclusão).
        return (
          <EmptyState
            title="Página fora do intervalo"
            description={`Só existem ${dados.totalPages} página(s) para este filtro.`}
            action={
              <Button variant="secondary" onClick={() => setPage(1)}>
                Ir para a primeira página
              </Button>
            }
          />
        )
      }
      return (
        <EmptyState
          title="Nenhum veículo cadastrado"
          description="Cadastre o primeiro veículo para começar."
          action={
            <Link to="/veiculos/novo">
              <Button>Adicionar veículo</Button>
            </Link>
          }
        />
      )
    }

    return (
      <div className="space-y-4">
        <VeiculosTable veiculos={items} carregando={false} />
        <VeiculosCards veiculos={items} carregando={false} />
        <VeiculosPager
          page={dados.page}
          totalPages={dados.totalPages}
          total={dados.total}
          pageSize={dados.pageSize}
          onPageChange={setPage}
        />
      </div>
    )
  }
}

function IconePlus() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
    </svg>
  )
}
