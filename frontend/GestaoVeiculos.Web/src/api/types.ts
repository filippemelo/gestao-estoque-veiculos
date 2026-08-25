import type { Situacao } from '@/schemas/enums'
export type { Situacao, Tipo } from '@/schemas/enums'
export { SITUACOES, TIPOS } from '@/schemas/enums'

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

// Opcional para permitir fallback quando o backend não trouxer o histórico
// embutido — o consumidor pode buscar em /proprietarios/veiculo/{id}.
export type VeiculoDetalhe = Veiculo & {
  proprietarios?: Proprietario[]
}

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

// PUT /veiculos/{id} não recebe placa (imutável). Quando situacao === 'Vendido',
// novoProprietario passa a ser obrigatório e a chamada faz a venda transacional.
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

// Envelope do backend: item único vem em { sucesso, dados: T, mensagem? }
// e listagem em { sucesso, dados: T[], paginacao: {...}, mensagem? }.
export type EnvelopeDados<T> = {
  sucesso: boolean
  dados: T
  mensagem?: string | null
}

export type PaginacaoBackend = {
  pagina: number
  tamanhoPagina: number
  totalRegistros: number
  totalPaginas: number
  temPaginaAnterior: boolean
  temProximaPagina: boolean
}

export type EnvelopePaginadoBackend<T> = {
  sucesso: boolean
  dados: T[]
  paginacao: PaginacaoBackend
  mensagem?: string | null
}

// Formato normalizado consumido pelos hooks/telas.
export type PaginaResultado<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// ErroResponse produzido pelo GlobalExceptionHandler do backend.
export type ErroDetalhe = {
  campo?: string | null
  mensagem: string
}

export type ErroResponse = {
  sucesso: false
  codigo: string
  mensagem: string
  erros?: ErroDetalhe[] | null
  traceId?: string | null
}
