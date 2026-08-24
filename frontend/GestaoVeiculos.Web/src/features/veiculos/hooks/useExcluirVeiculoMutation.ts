import { useMutation, useQueryClient } from '@tanstack/react-query'

import { excluirVeiculo } from '@/api/veiculos'

export function useExcluirVeiculoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => excluirVeiculo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      queryClient.invalidateQueries({ queryKey: ['proprietarios'] })
    },
  })
}
