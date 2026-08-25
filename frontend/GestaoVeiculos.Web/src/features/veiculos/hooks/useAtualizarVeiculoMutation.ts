import { useMutation, useQueryClient } from '@tanstack/react-query'

import { atualizarVeiculo } from '@/api/veiculos'
import type { AtualizarVeiculoInput } from '@/schemas/veiculo'

export function useAtualizarVeiculoMutation(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AtualizarVeiculoInput) => atualizarVeiculo(id, payload),
    onSuccess: () => {
      // Uma atualização pode mudar situação e proprietário atual — invalidamos ambos.
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      queryClient.invalidateQueries({ queryKey: ['proprietarios'] })
    },
  })
}
