import { useMutation, useQueryClient } from '@tanstack/react-query'

import { criarVeiculo } from '@/api/veiculos'
import type { CriarVeiculoInput } from '@/schemas/veiculo'

export function useCriarVeiculoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CriarVeiculoInput) => criarVeiculo(payload),
    onSuccess: () => {
      // Invalida qualquer variante da listagem — o próximo acesso vê o novo item.
      queryClient.invalidateQueries({ queryKey: ['veiculos'] })
    },
  })
}
