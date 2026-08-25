import { useState } from 'react'

import type { Proprietario } from '@/api/types'
import { ConfirmDialog, useToast } from '@/components/ui'
import { formatarCPF } from '@/lib/format'

import { useExcluirProprietarioMutation } from './hooks/useProprietarioMutations'

type Props = {
  proprietario: Proprietario
  // Render prop para deixar o consumidor controlar a aparência do trigger.
  children: (opts: { abrir: () => void; desabilitado: boolean; motivo?: string }) => React.ReactNode
}

export function AcaoExcluirProprietario({ proprietario, children }: Props) {
  const toast = useToast()
  const mutation = useExcluirProprietarioMutation()
  const [aberto, setAberto] = useState(false)

  const desabilitado = proprietario.isProprietarioAtual
  const motivo = desabilitado
    ? 'Não é possível excluir o proprietário atual. Encerre a posse antes.'
    : undefined

  function abrir() {
    if (desabilitado || mutation.isPending) return
    setAberto(true)
  }

  function confirmar() {
    mutation.mutate(proprietario.id, {
      onSuccess: () => {
        toast.show({ variant: 'success', title: 'Proprietário excluído' })
        setAberto(false)
      },
      onError: (err) => {
        toast.show({
          variant: 'error',
          title: 'Não foi possível excluir o proprietário',
          description: err instanceof Error ? err.message : String(err),
        })
        setAberto(false)
      },
    })
  }

  return (
    <>
      {children({ abrir, desabilitado, motivo })}
      <ConfirmDialog
        open={aberto}
        title="Excluir proprietário?"
        description={
          <div className="space-y-2">
            <p>
              Vai excluir{' '}
              <span className="font-medium text-slate-900">{proprietario.nomeCompleto}</span>{' '}
              (CPF <span className="num">{formatarCPF(proprietario.cpf)}</span>) do histórico
              deste veículo.
            </p>
            <p className="text-danger-700">Esta ação é permanente.</p>
          </div>
        }
        confirmLabel="Excluir proprietário"
        cancelLabel="Cancelar"
        variant="danger"
        loading={mutation.isPending}
        onConfirm={confirmar}
        onCancel={() => {
          if (!mutation.isPending) setAberto(false)
        }}
      />
    </>
  )
}
