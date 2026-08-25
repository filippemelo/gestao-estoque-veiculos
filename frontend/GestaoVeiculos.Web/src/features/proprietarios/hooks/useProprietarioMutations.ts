import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  atualizarProprietario,
  criarProprietario,
  excluirProprietario,
} from '@/api/proprietarios'
import type {
  AtualizarProprietarioRequest,
  CriarProprietarioRequest,
} from '@/api/types'

// Encerrar posse muda a situação do veículo — invalidamos ambos os escopos.
function invalidacoes(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['proprietarios'] })
  queryClient.invalidateQueries({ queryKey: ['veiculos'] })
}

export function useCriarProprietarioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CriarProprietarioRequest) => criarProprietario(payload),
    onSuccess: () => invalidacoes(queryClient),
  })
}

export function useAtualizarProprietarioMutation(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AtualizarProprietarioRequest) =>
      atualizarProprietario(id, payload),
    onSuccess: () => invalidacoes(queryClient),
  })
}

export function useExcluirProprietarioMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => excluirProprietario(id),
    onSuccess: () => invalidacoes(queryClient),
  })
}
