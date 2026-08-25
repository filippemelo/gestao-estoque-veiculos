import { request } from './http'
import type {
  AtualizarVeiculoRequest,
  CriarVeiculoRequest,
  EnvelopeDados,
  EnvelopePaginadoBackend,
  ListarVeiculosParams,
  PaginaResultado,
  Veiculo,
  VeiculoDetalhe,
} from './types'

function normalizarPaginado<T>(raw: EnvelopePaginadoBackend<T>): PaginaResultado<T> {
  return {
    items: raw.dados,
    page: raw.paginacao.pagina,
    pageSize: raw.paginacao.tamanhoPagina,
    total: raw.paginacao.totalRegistros,
    totalPages: raw.paginacao.totalPaginas,
  }
}

function desembrulhar<T>(raw: EnvelopeDados<T>): T {
  return raw.dados
}

export async function listarVeiculos(
  params: ListarVeiculosParams = {},
  signal?: AbortSignal,
): Promise<PaginaResultado<Veiculo>> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const raw = await request<EnvelopePaginadoBackend<Veiculo>>('/veiculos', {
    query: {
      Marca: params.marca,
      Situacao: params.situacao,
      Page: page,
      PageSize: pageSize,
    },
    signal,
  })
  return normalizarPaginado(raw)
}

export async function obterVeiculo(id: number, signal?: AbortSignal): Promise<VeiculoDetalhe> {
  const raw = await request<EnvelopeDados<VeiculoDetalhe>>(`/veiculos/${id}`, {
    signal,
  })
  return desembrulhar(raw)
}

export async function criarVeiculo(
  payload: CriarVeiculoRequest,
  signal?: AbortSignal,
): Promise<Veiculo> {
  const raw = await request<EnvelopeDados<Veiculo>>('/veiculos', {
    method: 'POST',
    body: payload,
    signal,
  })
  return desembrulhar(raw)
}

export async function atualizarVeiculo(
  id: number,
  payload: AtualizarVeiculoRequest,
  signal?: AbortSignal,
): Promise<Veiculo> {
  const raw = await request<EnvelopeDados<Veiculo>>(`/veiculos/${id}`, {
    method: 'PUT',
    body: payload,
    signal,
  })
  return desembrulhar(raw)
}

export async function excluirVeiculo(id: number, signal?: AbortSignal): Promise<void> {
  await request<null>(`/veiculos/${id}`, { method: 'DELETE', signal })
}
