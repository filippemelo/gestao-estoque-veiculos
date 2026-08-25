// HTTP client — único ponto de contato com o backend.
// Responsabilidades: base URL, JSON in/out, timeout, tradução de erros do
// ProblemDetails para uma ApiError com mensagem legível.

import type { ProblemDetails } from './types'

const DEFAULT_TIMEOUT_MS = 15_000

export class ApiError extends Error {
  readonly status: number
  readonly title: string | undefined
  readonly detail: string | undefined
  readonly problemDetails: ProblemDetails | undefined

  constructor(
    message: string,
    status: number,
    parts: {
      title?: string
      detail?: string
      problemDetails?: ProblemDetails
    } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.title = parts.title
    this.detail = parts.detail
    this.problemDetails = parts.problemDetails
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

// Une timeout local + signal externo (do react-query, por exemplo).
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

function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.title === 'string' ||
    typeof v.detail === 'string' ||
    typeof v.status === 'number' ||
    typeof v.type === 'string'
  )
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
    // Body pode estar vazio mesmo com content-type — tolerar.
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
  title?: string
  detail?: string
  problemDetails?: ProblemDetails
} {
  if (isProblemDetails(body)) {
    const pd = body
    // Se houver "errors" (validação), concatena tudo em uma mensagem legível.
    let extra = ''
    if (pd.errors) {
      const parts: string[] = []
      for (const [field, msgs] of Object.entries(pd.errors)) {
        parts.push(`${field}: ${msgs.join(', ')}`)
      }
      if (parts.length > 0) extra = ` (${parts.join('; ')})`
    }
    const message = pd.detail?.trim()
      ? `${pd.detail}${extra}`
      : (pd.title ?? mensagemGenerica(status)) + extra
    return { message, title: pd.title, detail: pd.detail, problemDetails: pd }
  }
  if (typeof body === 'string' && body.trim() !== '') {
    return { message: body, detail: body }
  }
  return { message: mensagemGenerica(status) }
}

// Fallback humano quando o backend não fornece detail nem title.
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
      // Diferencia timeout de cancelamento externo.
      if (externalSignal?.aborted) throw err
      throw new ApiError('Tempo limite excedido ao contatar a API.', 0)
    }
    throw new ApiError(
      'Falha de rede ao contatar a API. Verifique sua conexão.',
      0,
      { detail: err instanceof Error ? err.message : String(err) },
    )
  }
  cleanup()

  const parsedBody = await parseResponseBody(response)

  if (!response.ok) {
    const { message, title, detail, problemDetails } = buildErrorMessage(
      response.status,
      parsedBody,
    )
    throw new ApiError(message, response.status, { title, detail, problemDetails })
  }

  return parsedBody as T
}
