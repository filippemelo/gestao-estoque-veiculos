// Tipos de domínio e de contrato compartilhados por toda a camada de API.
// Nomes de campos de negócio ficam em português (situacao, proprietarioAtual)
// porque espelham a linguagem do domínio; nomes de infraestrutura ficam em inglês.

// -------------------- Enums do domínio --------------------
// Fonte da verdade: src/schemas/enums.ts (schemas Zod). Re-exportado
// aqui para manter compatibilidade com quem já importava de @/api/types.
import type { Situacao } from '@/schemas/enums'
export type { Situacao, Tipo } from '@/schemas/enums'
export { SITUACOES, TIPOS } from '@/schemas/enums'

// -------------------- Entidades --------------------
export type Veiculo = {
  id: number
  marca: string
  modelo: string
  ano: number
  cor: string
  preco: number
  tipo: string
  situacao: string
  placa: string
  quilometragem: number
}

export type Proprietario = {
  id: number
  nomeCompleto: string
  cpf: string
  // Datas chegam como string ISO local do backend (ex.: "2026-08-24T00:00:00").
  dataAquisicao: string
  dataVenda: string | null
  observacao: string | null
  isProprietarioAtual: boolean
}

// Detalhe do veículo — normalmente vem com o histórico de proprietários
// embutido. Marcado como opcional para o consumidor ter fallback explícito
// (chamar /proprietarios/veiculo/{id}) caso o backend um dia deixe de embutir.
export type VeiculoDetalhe = Veiculo & {
  proprietarios?: Proprietario[]
}

// -------------------- Requests --------------------
export type CriarVeiculoRequest = {
  marca: string
  modelo: string
  ano: number
  cor: string
  preco: number
  tipo: string
  placa: string
  quilometragem: number
}

export type NovoProprietarioRequest = {
  nomeCompleto: string
  cpf: string
  observacao?: string | null
}

// PUT /veiculos/{id} — não recebe placa (imutável). Quando situacao === 'Vendido',
// novoProprietario é obrigatório e a chamada faz a venda transacional.
export type AtualizarVeiculoRequest = {
  marca: string
  modelo: string
  ano: number
  cor: string
  preco: number
  tipo: string
  situacao: string
  quilometragem: number
  novoProprietario?: NovoProprietarioRequest | null
}

export type CriarProprietarioRequest = {
  veiculoId: number
  nomeCompleto: string
  cpf: string
  observacao?: string | null
}

export type AtualizarProprietarioRequest = {
  nomeCompleto: string
  cpf: string
  dataVenda?: string | null
  observacao?: string | null
}

export type ListarVeiculosParams = {
  marca?: string
  situacao?: Situacao
  page?: number
  pageSize?: number
}

// -------------------- Envelopes --------------------
// Como o backend responde: item único vem em { dados: T } e listagem em
// { dados: T[], pagina, tamanho, total, totalPaginas }. Isolamos esses envelopes
// aqui — o resto do app consome os formatos normalizados abaixo.
export type EnvelopeDados<T> = { dados: T }
export type EnvelopePaginadoBackend<T> = {
  dados: T[]
  pagina: number
  tamanho: number
  total: number
  totalPaginas: number
}

// Formato normalizado que os hooks/telas enxergam.
export type PaginaResultado<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// -------------------- ProblemDetails --------------------
// Formato de erro produzido pelo GlobalExceptionHandler do backend.
export type ProblemDetails = {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  traceId?: string
  errors?: Record<string, string[]>
}
