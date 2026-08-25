// Não expomos listagem geral de proprietários: por decisão do produto,
// proprietário só aparece no contexto de um veículo.

import { request } from './http'
import type {
  AtualizarProprietarioRequest,
  CriarProprietarioRequest,
  EnvelopeDados,
  Proprietario,
} from './types'

function desembrulhar<T>(raw: EnvelopeDados<T> | T): T {
  if (typeof raw === 'object' && raw !== null && 'dados' in raw) {
    return (raw as EnvelopeDados<T>).dados
  }
  return raw as T
}

// Ordenação por dataAquisicao é contrato de UI (histórico exibido crescente).
function ordenarPorAquisicao(lista: Proprietario[]): Proprietario[] {
  return [...lista].sort((a, b) => a.dataAquisicao.localeCompare(b.dataAquisicao))
}

export async function listarProprietariosDoVeiculo(
  veiculoId: number,
  signal?: AbortSignal,
): Promise<Proprietario[]> {
  const raw = await request<EnvelopeDados<Proprietario[]> | Proprietario[]>(
    `/proprietarios/veiculo/${veiculoId}`,
    { signal },
  )
  const lista = desembrulhar(raw)
  return ordenarPorAquisicao(lista)
}

export async function criarProprietario(
  payload: CriarProprietarioRequest,
  signal?: AbortSignal,
): Promise<Proprietario> {
  const raw = await request<EnvelopeDados<Proprietario> | Proprietario>('/proprietarios', {
    method: 'POST',
    body: payload,
    signal,
  })
  return desembrulhar(raw)
}

export async function atualizarProprietario(
  id: number,
  payload: AtualizarProprietarioRequest,
  signal?: AbortSignal,
): Promise<Proprietario> {
  const raw = await request<EnvelopeDados<Proprietario> | Proprietario>(
    `/proprietarios/${id}`,
    { method: 'PUT', body: payload, signal },
  )
  return desembrulhar(raw)
}

export async function excluirProprietario(id: number, signal?: AbortSignal): Promise<void> {
  await request<null>(`/proprietarios/${id}`, { method: 'DELETE', signal })
}
