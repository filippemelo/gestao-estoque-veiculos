import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { ListarVeiculosParams } from '@/api/types'
import { listarVeiculos } from '@/api/veiculos'

export function veiculosListaQueryKey(params: ListarVeiculosParams) {
  return ['veiculos', 'lista', params] as const
}

export function useVeiculosQuery(params: ListarVeiculosParams) {
  return useQuery({
    queryKey: veiculosListaQueryKey(params),
    queryFn: ({ signal }) => listarVeiculos(params, signal),
    // Mantém dados antigos visíveis durante transições — evita flash de skeleton.
    placeholderData: keepPreviousData,
  })
}
