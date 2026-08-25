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

// Aceita array puro OU envelope paginado; devolve sempre o formato normalizado.
function normalizarPaginado<T>(
  raw: EnvelopePaginadoBackend<T> | T[],
  fallback: { page: number; pageSize: number },
): PaginaResultado<T> {
  if (Array.isArray(raw)) {
    return {
      items: raw,
      page: fallback.page,
      pageSize: fallback.pageSize,
      total: raw.length,
      totalPages: raw.length === 0 ? 0 : 1,
    }
  }
  return {
    items: raw.dados,
    page: raw.pagina,
    pageSize: raw.tamanho,
    total: raw.total,
    totalPages: raw.totalPaginas,
  }
}

function desembrulhar<T>(raw: EnvelopeDados<T> | T): T {
  if (typeof raw === 'object' && raw !== null && 'dados' in raw) {
    return (raw as EnvelopeDados<T>).dados
  }
  return raw as T
}

export async function listarVeiculos(
  params: ListarVeiculosParams = {},
  signal?: AbortSignal,
): Promise<PaginaResultado<Veiculo>> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const raw = await request<EnvelopePaginadoBackend<Veiculo> | Veiculo[]>('/veiculos', {
    query: {
      Marca: params.marca,
      Situacao: params.situacao,
      Page: page,
      PageSize: pageSize,
    },
    signal,
  })
  return normalizarPaginado(raw, { page, pageSize })
}

export async function obterVeiculo(id: number, signal?: AbortSignal): Promise<VeiculoDetalhe> {
  const raw = await request<EnvelopeDados<VeiculoDetalhe> | VeiculoDetalhe>(`/veiculos/${id}`, {
    signal,
  })
  return desembrulhar(raw)
}

export async function criarVeiculo(
  payload: CriarVeiculoRequest,
  signal?: AbortSignal,
): Promise<Veiculo> {
  const raw = await request<EnvelopeDados<Veiculo> | Veiculo>('/veiculos', {
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
  const raw = await request<EnvelopeDados<Veiculo> | Veiculo>(`/veiculos/${id}`, {
    method: 'PUT',
    body: payload,
    signal,
  })
  return desembrulhar(raw)
}

export async function excluirVeiculo(id: number, signal?: AbortSignal): Promise<void> {
  await request<null>(`/veiculos/${id}`, { method: 'DELETE', signal })
}
