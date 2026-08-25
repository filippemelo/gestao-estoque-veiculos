import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Proprietario, Veiculo } from '@/api/types'
import { Button, ConfirmDialog, useToast } from '@/components/ui'
import { formatarPlaca } from '@/lib/format'

import { useExcluirVeiculoMutation } from './hooks/useExcluirVeiculoMutation'

type Props = {
  veiculo: Veiculo
  // undefined = ainda carregando o histórico. Enquanto isso o botão fica
  // desabilitado — não sabemos ainda se a exclusão é permitida.
  proprietarios: Proprietario[] | undefined
}

export function AcaoExcluirVeiculo({ veiculo, proprietarios }: Props) {
  const navigate = useNavigate()
  const toast = useToast()
  const mutation = useExcluirVeiculoMutation()
  const [aberto, setAberto] = useState(false)

  const enviando = mutation.isPending
  const totalProprietarios = proprietarios?.length ?? 0
  const carregandoHistorico = proprietarios === undefined
  const bloqueadoNoFront = carregandoHistorico || totalProprietarios > 0

  const tituloBotao = carregandoHistorico
    ? 'Aguardando o histórico de proprietários carregar…'
    : totalProprietarios > 0
      ? `Não é possível excluir: veículo tem ${totalProprietarios} proprietário${
          totalProprietarios === 1 ? '' : 's'
        } no histórico.`
      : undefined

  function abrir() {
    if (bloqueadoNoFront || enviando) return
    setAberto(true)
  }

  function confirmar() {
    mutation.mutate(veiculo.id, {
      onSuccess: () => {
        toast.show({ variant: 'success', title: 'Veículo excluído' })
        setAberto(false)
        // A lista já foi invalidada pela mutation — o próximo render busca fresco.
        navigate('/veiculos')
      },
      onError: (err) => {
        // O backend é a fonte da verdade. Mesmo com o bloqueio no front,
        // pode haver casos de corrida (proprietário criado por outra sessão).
        const mensagem = err instanceof Error ? err.message : String(err)
        toast.show({
          variant: 'error',
          title: 'Não foi possível excluir o veículo',
          description: mensagem,
        })
        setAberto(false)
      },
    })
  }

  return (
    <>
      <Button
        variant="danger"
        onClick={abrir}
        disabled={bloqueadoNoFront || enviando}
        title={tituloBotao}
      >
        Excluir
      </Button>

      <ConfirmDialog
        open={aberto}
        title="Excluir veículo?"
        description={
          <div className="space-y-2">
            <p>
              Vai excluir{' '}
              <span className="font-medium text-slate-900">
                {veiculo.marca} {veiculo.modelo}
              </span>{' '}
              (placa <span className="num">{formatarPlaca(veiculo.placa)}</span>).
            </p>
            <p className="text-danger-700">
              Esta ação é permanente e não pode ser desfeita.
            </p>
          </div>
        }
        confirmLabel="Excluir veículo"
        cancelLabel="Cancelar"
        variant="danger"
        loading={enviando}
        onConfirm={confirmar}
        onCancel={() => {
          if (!enviando) setAberto(false)
        }}
      />
    </>
  )
}
