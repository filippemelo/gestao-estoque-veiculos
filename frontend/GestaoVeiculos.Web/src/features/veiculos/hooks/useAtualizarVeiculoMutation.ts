import { useMutation, useQueryClient } from '@tanstack/react-query'

import { atualizarVeiculo } from '@/api/veiculos'
import type { AtualizarVeiculoInput } from '@/schemas/veiculo'

export function useAtualizarVeiculoMutation(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AtualizarVeiculoInput) => atualizarVeiculo(id, payload),
    onSuccess: () => {
      // Preço, situação, km e proprietário atual mudam — invalidamos ambos os
      // domínios pra o detalhe e a lista voltarem sincronizados.
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      queryClient.invalidateQueries({ queryKey: ['proprietarios'] })
    },
  })
}
