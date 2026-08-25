import type { ErroDetalhe, ErroResponse } from './types'

const DEFAULT_TIMEOUT_MS = 15_000

export class ApiError extends Error {
  readonly status: number
  readonly codigo: string | undefined
  readonly erros: ErroDetalhe[] | undefined
  readonly traceId: string | undefined
  readonly erroResponse: ErroResponse | undefined

  constructor(
    message: string,
    status: number,
    parts: {
      codigo?: string
      erros?: ErroDetalhe[]
      traceId?: string
      erroResponse?: ErroResponse
    } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.codigo = parts.codigo
    this.erros = parts.erros
    this.traceId = parts.traceId
    this.erroResponse = parts.erroResponse
  }
}

export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue>

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  query?: QueryParams
  signal?: AbortSignal
  timeoutMs?: number
  headers?: HeadersInit
}

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error(
      'VITE_API_BASE_URL não configurada. Copie .env.example para .env.local e defina a URL da API.',
    )
  }
  return raw.replace(/\/+$/, '')
}

function buildUrl(path: string, query: QueryParams | undefined): string {
  const base = getBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${normalizedPath}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.append(key, String(value))
    }
  }
  return url.toString()
}

// Combina timeout local com signal externo (ex.: cancelamento do react-query).
function combineSignals(externalSignal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(new DOMException('Tempo limite excedido.', 'TimeoutError')),
    timeoutMs,
  )
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason)
    } else {
      externalSignal.addEventListener(
        'abort',
        () => controller.abort(externalSignal.reason),
        { once: true },
      )
    }
  }
  const cleanup = () => clearTimeout(timeoutId)
  return { signal: controller.signal, cleanup }
}

function isErroResponse(value: unknown): value is ErroResponse {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return v.sucesso === false && typeof v.codigo === 'string' && typeof v.mensagem === 'string'
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
    // Alguns backends enviam content-type JSON com corpo vazio; toleramos.
    const text = await response.text()
    if (text === '') return null
    try {
      return JSON.parse(text) as unknown
    } catch {
      return text
    }
  }
  const text = await response.text()
  return text === '' ? null : text
}

function buildErrorMessage(status: number, body: unknown): {
  message: string
  codigo?: string
  erros?: ErroDetalhe[]
  traceId?: string
  erroResponse?: ErroResponse
} {
  if (isErroResponse(body)) {
    const erros = body.erros ?? undefined
    // Se há erros de campo, agrega numa mensagem única para exibição fallback.
    let extra = ''
    if (erros && erros.length > 0) {
      const partes = erros.map((e) => (e.campo ? `${e.campo}: ${e.mensagem}` : e.mensagem))
      extra = ` (${partes.join('; ')})`
    }
    return {
      message: `${body.mensagem}${extra}`,
      codigo: body.codigo,
      erros,
      traceId: body.traceId ?? undefined,
      erroResponse: body,
    }
  }
  if (typeof body === 'string' && body.trim() !== '') {
    return { message: body }
  }
  return { message: mensagemGenerica(status) }
}

// Fallback em pt-BR quando o backend não fornece corpo estruturado.
function mensagemGenerica(status: number): string {
  if (status >= 500) return 'O servidor encontrou um problema. Tente novamente em instantes.'
  if (status === 404) return 'O recurso solicitado não foi encontrado.'
  if (status === 403) return 'Você não tem permissão para essa operação.'
  if (status === 401) return 'Sessão expirada. Faça login novamente.'
  if (status === 409) return 'Não foi possível concluir por conflito de estado.'
  if (status >= 400) return 'Requisição inválida.'
  return 'Não foi possível concluir a solicitação.'
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    query,
    signal: externalSignal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
  } = options

  const url = buildUrl(path, query)
  const { signal, cleanup } = combineSignals(externalSignal, timeoutMs)

  const init: RequestInit = { method, signal, headers }

  if (body !== undefined) {
    init.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(headers ?? {}),
    }
    init.body = JSON.stringify(body)
  } else {
    init.headers = { Accept: 'application/json', ...(headers ?? {}) }
  }

  let response: Response
  try {
    response = await fetch(url, init)
  } catch (err) {
    cleanup()
    if (err instanceof DOMException && err.name === 'AbortError') {
      // Cancelamento externo propaga; abort local vira timeout.
      if (externalSignal?.aborted) throw err
      throw new ApiError('Tempo limite excedido ao contatar a API.', 0)
    }
    throw new ApiError(
      'Falha de rede ao contatar a API. Verifique sua conexão.',
      0,
    )
  }
  cleanup()

  const parsedBody = await parseResponseBody(response)

  if (!response.ok) {
    const parts = buildErrorMessage(response.status, parsedBody)
    throw new ApiError(parts.message, response.status, {
      codigo: parts.codigo,
      erros: parts.erros,
      traceId: parts.traceId,
      erroResponse: parts.erroResponse,
    })
  }

  return parsedBody as T
}
