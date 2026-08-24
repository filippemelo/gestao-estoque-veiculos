import { useQuery } from '@tanstack/react-query'

import { obterVeiculo } from '@/api/veiculos'

export function veiculoDetalheQueryKey(id: number) {
  return ['veiculos', 'detalhe', id] as const
}

export function useVeiculoDetalheQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: veiculoDetalheQueryKey(id),
    queryFn: ({ signal }) => obterVeiculo(id, signal),
    enabled,
  })
}
