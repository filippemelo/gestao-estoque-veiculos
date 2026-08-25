import { useMutation, useQueryClient } from '@tanstack/react-query'

import { criarVeiculo } from '@/api/veiculos'
import type { CriarVeiculoInput } from '@/schemas/veiculo'

export function useCriarVeiculoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CriarVeiculoInput) => criarVeiculo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
    },
  })
}
