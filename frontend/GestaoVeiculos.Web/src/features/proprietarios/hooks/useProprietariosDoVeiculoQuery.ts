import { useQuery } from '@tanstack/react-query'

import { listarProprietariosDoVeiculo } from '@/api/proprietarios'

export function proprietariosDoVeiculoQueryKey(veiculoId: number) {
  return ['proprietarios', 'porVeiculo', veiculoId] as const
}

export function useProprietariosDoVeiculoQuery(
  veiculoId: number,
  opts: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: proprietariosDoVeiculoQueryKey(veiculoId),
    queryFn: ({ signal }) => listarProprietariosDoVeiculo(veiculoId, signal),
    enabled: opts.enabled ?? true,
  })
}
