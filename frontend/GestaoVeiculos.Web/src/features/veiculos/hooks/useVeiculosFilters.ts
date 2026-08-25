import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { Situacao } from '@/api/types'
import { SITUACOES } from '@/api/types'

// Fonte da verdade dos filtros é a query string; mudança de filtro reseta a página.
export const PAGE_SIZE_PADRAO = 20

export type FiltrosVeiculos = {
  marca: string
  situacao: Situacao | ''
  page: number
  pageSize: number
}

function ehSituacao(valor: string | null): valor is Situacao {
  return valor !== null && (SITUACOES as readonly string[]).includes(valor)
}

export function useVeiculosFilters() {
  const [urlParams, setUrlParams] = useSearchParams()

  const filtros = useMemo<FiltrosVeiculos>(() => {
    const marca = urlParams.get('marca')?.trim() ?? ''
    const situacaoParam = urlParams.get('situacao')
    const situacao: Situacao | '' = ehSituacao(situacaoParam) ? situacaoParam : ''
    const pageRaw = Number(urlParams.get('page') ?? '1')
    const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1
    return { marca, situacao, page, pageSize: PAGE_SIZE_PADRAO }
  }, [urlParams])

  const setFiltros = useCallback(
    (
      next: Partial<Pick<FiltrosVeiculos, 'marca' | 'situacao'>>,
      opts: { replace?: boolean } = {},
    ) => {
      setUrlParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (next.marca !== undefined) {
            if (next.marca) p.set('marca', next.marca)
            else p.delete('marca')
          }
          if (next.situacao !== undefined) {
            if (next.situacao) p.set('situacao', next.situacao)
            else p.delete('situacao')
          }
          p.delete('page')
          return p
        },
        { replace: opts.replace ?? false },
      )
    },
    [setUrlParams],
  )

  const setPage = useCallback(
    (page: number) => {
      setUrlParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (page <= 1) p.delete('page')
          else p.set('page', String(page))
          return p
        },
        { replace: false },
      )
    },
    [setUrlParams],
  )

  const limpar = useCallback(() => {
    setUrlParams(new URLSearchParams(), { replace: false })
  }, [setUrlParams])

  const temFiltro = filtros.marca !== '' || filtros.situacao !== ''

  return { filtros, setFiltros, setPage, limpar, temFiltro }
}
