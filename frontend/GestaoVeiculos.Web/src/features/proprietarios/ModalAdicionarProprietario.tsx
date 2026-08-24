import type { FormEvent } from 'react'
import { useRef, useState } from 'react'

import { Button, Modal, useToast } from '@/components/ui'
import { criarProprietarioSchema } from '@/schemas/proprietario'

import type {
  CamposProprietarioErros,
  CamposProprietarioRefs,
  CamposProprietarioValues,
} from './CamposProprietario'
import { CamposProprietario } from './CamposProprietario'
import { useCriarProprietarioMutation } from './hooks/useProprietarioMutations'

type Props = {
  aberto: boolean
  onFechar: () => void
  veiculoId: number
}

const VAZIO: CamposProprietarioValues = {
  nomeCompleto: '',
  cpf: '',
  observacao: '',
  dataVenda: '',
}

const ORDEM_CAMPOS: readonly (keyof CamposProprietarioValues)[] = [
  'nomeCompleto',
  'cpf',
  'observacao',
]

export function ModalAdicionarProprietario({ aberto, onFechar, veiculoId }: Props) {
  const toast = useToast()
  const mutation = useCriarProprietarioMutation()

  const [values, setValues] = useState<CamposProprietarioValues>(VAZIO)
  const [erros, setErros] = useState<CamposProprietarioErros>({})

  const refs: CamposProprietarioRefs = {
    nomeCompleto: useRef<HTMLInputElement>(null),
    cpf: useRef<HTMLInputElement>(null),
    observacao: useRef<HTMLTextAreaElement>(null),
  }

  function fechar() {
    if (mutation.isPending) return
    setValues(VAZIO)
    setErros({})
    onFechar()
  }

  function setCampo<K extends keyof CamposProprietarioValues>(
    campo: K,
    valor: CamposProprietarioValues[K],
  ) {
    setValues((v) => ({ ...v, [campo]: valor }))
    setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
  }

  function focarPrimeiro(errosNovos: CamposProprietarioErros) {
    for (const campo of ORDEM_CAMPOS) {
      if (errosNovos[campo]) {
        refs[campo]?.current?.focus()
        return
      }
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (mutation.isPending) return

    const payload = {
      veiculoId,
      nomeCompleto: values.nomeCompleto,
      cpf: values.cpf,
      observacao: values.observacao.trim() || null,
    }

    const resultado = criarProprietarioSchema.safeParse(payload)
    if (!resultado.success) {
      const novos: CamposProprietarioErros = {}
      for (const issue of resultado.error.issues) {
        const campo = issue.path[0]
        if (typeof campo === 'string' && campo in VAZIO && !novos[campo as keyof CamposProprietarioValues]) {
          novos[campo as keyof CamposProprietarioValues] = issue.message
        }
      }
      setErros(novos)
      focarPrimeiro(novos)
      return
    }

    mutation.mutate(resultado.data, {
      onSuccess: () => {
        toast.show({ variant: 'success', title: 'Proprietário adicionado' })
        setValues(VAZIO)
        setErros({})
        onFechar()
      },
      onError: (err) => {
        toast.show({
          variant: 'error',
          title: 'Não foi possível adicionar o proprietário',
          description: err instanceof Error ? err.message : String(err),
        })
      },
    })
  }

  const enviando = mutation.isPending

  return (
    <Modal
      open={aberto}
      onClose={fechar}
      title="Adicionar proprietário"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={fechar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-adicionar-proprietario" loading={enviando}>
            Adicionar proprietário
          </Button>
        </>
      }
    >
      <form id="form-adicionar-proprietario" onSubmit={handleSubmit} noValidate>
        <p className="mb-3 text-xs text-slate-500">
          A data de aquisição será definida automaticamente como hoje.
        </p>
        <CamposProprietario
          values={values}
          erros={erros}
          onChange={setCampo}
          disabled={enviando}
          refs={refs}
        />
      </form>
    </Modal>
  )
}
