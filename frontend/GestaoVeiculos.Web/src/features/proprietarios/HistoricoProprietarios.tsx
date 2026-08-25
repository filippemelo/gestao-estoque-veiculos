import type { ReactNode } from 'react'
import { useState } from 'react'

import type { Proprietario } from '@/api/types'
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatarCPF, formatarData } from '@/lib/format'

import { AcaoExcluirProprietario } from './AcaoExcluirProprietario'
import { ModalEditarProprietario } from './ModalEditarProprietario'

type Props = {
  proprietarios: Proprietario[] | undefined
  carregando: boolean
  erro?: unknown
  onTentarNovamente?: () => void
  onAdicionar: () => void
  temProprietarioAtual: boolean
}

// Ordena por dataAquisicao — quando o array vem embutido no VeiculoDetalhe
// não há garantia formal de ordem.
export function HistoricoProprietarios({
  proprietarios,
  carregando,
  erro,
  onTentarNovamente,
  onAdicionar,
  temProprietarioAtual,
}: Props) {
  const [editando, setEditando] = useState<Proprietario | null>(null)

  return (
    <section
      aria-label="Histórico de proprietários"
      className="space-y-3 rounded-lg border border-border-subtle bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Histórico de proprietários</h2>
          <p className="text-xs text-slate-500">
            Ordenado por data de aquisição. O proprietário atual está destacado.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={onAdicionar}
          disabled={temProprietarioAtual}
          title={
            temProprietarioAtual
              ? 'Este veículo já tem um proprietário atual. Para trocar, edite o veículo e marque como Vendido.'
              : undefined
          }
        >
          Adicionar proprietário
        </Button>
      </header>

      {renderConteudo()}

      <ModalEditarProprietario
        aberto={editando !== null}
        onFechar={() => setEditando(null)}
        proprietario={editando}
      />
    </section>
  )

  function renderConteudo(): ReactNode {
    if (erro) {
      return (
        <ErrorState
          title="Não foi possível carregar os proprietários."
          description={erro instanceof Error ? erro.message : String(erro)}
          onRetry={onTentarNovamente}
        />
      )
    }
    if (carregando) return <SkeletonHistorico />

    const lista = ordenarPorAquisicao(proprietarios ?? [])
    if (lista.length === 0) {
      return (
        <EmptyState
          title="Nenhum proprietário cadastrado"
          description="Adicione um proprietário para registrar o histórico deste veículo."
          compact
        />
      )
    }

    return (
      <Table>
        <THead>
          <TR>
            <TH>Nome</TH>
            <TH className="w-40">CPF</TH>
            <TH className="w-32">Aquisição</TH>
            <TH className="w-32">Venda</TH>
            <TH>Observação</TH>
            <TH className="w-40 text-right">Ações</TH>
          </TR>
        </THead>
        <TBody>
          {lista.map((p) => (
            <TR key={p.id} className={cn(p.isProprietarioAtual && 'bg-primary-50/60')}>
              <TD>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('text-slate-900', p.isProprietarioAtual && 'font-semibold')}>
                    {p.nomeCompleto}
                  </span>
                  {p.isProprietarioAtual ? (
                    <Badge variant="info">Proprietário atual</Badge>
                  ) : null}
                </div>
              </TD>
              <TD className="num text-slate-700">{formatarCPF(p.cpf)}</TD>
              <TD className="num text-slate-700">{formatarData(p.dataAquisicao)}</TD>
              <TD className="num text-slate-700">
                {p.dataVenda ? formatarData(p.dataVenda) : '—'}
              </TD>
              <TD className="text-slate-700">{p.observacao?.trim() || '—'}</TD>
              <TD className="text-right">
                <div className="inline-flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditando(p)}
                    className="rounded px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Editar
                  </button>
                  <AcaoExcluirProprietario proprietario={p}>
                    {({ abrir, desabilitado, motivo }) => (
                      <button
                        type="button"
                        onClick={abrir}
                        disabled={desabilitado}
                        title={motivo}
                        className={cn(
                          'rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                          desabilitado
                            ? 'cursor-not-allowed text-slate-400'
                            : 'text-danger-700 hover:bg-danger-50',
                        )}
                      >
                        Excluir
                      </button>
                    )}
                  </AcaoExcluirProprietario>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    )
  }
}

function ordenarPorAquisicao(lista: Proprietario[]): Proprietario[] {
  return [...lista].sort((a, b) => a.dataAquisicao.localeCompare(b.dataAquisicao))
}

function SkeletonHistorico() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
}
