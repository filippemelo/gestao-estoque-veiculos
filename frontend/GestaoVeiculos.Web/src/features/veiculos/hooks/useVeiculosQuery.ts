import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { ListarVeiculosParams } from '@/api/types'
import { listarVeiculos } from '@/api/veiculos'

// Chave estável para o cache. Espalhamos os params para invalidação granular
// (invalidate ['veiculos','lista'] atinge todas as combinações).
export function veiculosListaQueryKey(params: ListarVeiculosParams) {
  return ['veiculos', 'lista', params] as const
}

export function useVeiculosQuery(params: ListarVeiculosParams) {
  return useQuery({
    queryKey: veiculosListaQueryKey(params),
    queryFn: ({ signal }) => listarVeiculos(params, signal),
    // Mantém os dados antigos visíveis enquanto o backend responde a nova
    // combinação de filtros — sem flash de skeleton em transições.
    placeholderData: keepPreviousData,
  })
}
