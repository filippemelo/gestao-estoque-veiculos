import type { FormEvent } from 'react'
import { useMemo, useRef, useState } from 'react'

import type { Proprietario } from '@/api/types'
import { Button, Modal, useToast } from '@/components/ui'
import { criarAtualizarProprietarioSchema } from '@/schemas/proprietario'

import type {
  CamposProprietarioErros,
  CamposProprietarioRefs,
  CamposProprietarioValues,
} from './CamposProprietario'
import { CamposProprietario } from './CamposProprietario'
import { useAtualizarProprietarioMutation } from './hooks/useProprietarioMutations'

type Props = {
  aberto: boolean
  onFechar: () => void
  proprietario: Proprietario | null
}

const ORDEM_CAMPOS: readonly (keyof CamposProprietarioValues)[] = [
  'nomeCompleto',
  'cpf',
  'observacao',
  'dataVenda',
]

// Backend devolve "2026-08-24T00:00:00"; <input type="date"> espera "2026-08-24".
function paraIsoDate(v: string | null | undefined): string {
  if (!v) return ''
  return v.slice(0, 10)
}

export function ModalEditarProprietario({ aberto, onFechar, proprietario }: Props) {
  const toast = useToast()
  const mutation = useAtualizarProprietarioMutation(proprietario?.id ?? 0)

  // Reinicializa quando o modal reabre com outro proprietário (setState-durante-render).
  const iniciais = useMemo<CamposProprietarioValues>(
    () =>
      proprietario
        ? {
            nomeCompleto: proprietario.nomeCompleto,
            cpf: proprietario.cpf,
            observacao: proprietario.observacao ?? '',
            dataVenda: paraIsoDate(proprietario.dataVenda),
          }
        : { nomeCompleto: '', cpf: '', observacao: '', dataVenda: '' },
    [proprietario],
  )

  const [values, setValues] = useState<CamposProprietarioValues>(iniciais)
  const [erros, setErros] = useState<CamposProprietarioErros>({})

  const [proprietarioSincronizado, setProprietarioSincronizado] = useState<
    Proprietario | null
  >(proprietario)
  if (proprietario !== proprietarioSincronizado) {
    setProprietarioSincronizado(proprietario)
    setValues(iniciais)
    setErros({})
  }

  const refs: CamposProprietarioRefs = {
    nomeCompleto: useRef<HTMLInputElement>(null),
    cpf: useRef<HTMLInputElement>(null),
    observacao: useRef<HTMLTextAreaElement>(null),
    dataVenda: useRef<HTMLInputElement>(null),
  }

  function fechar() {
    if (mutation.isPending) return
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
    if (!proprietario || mutation.isPending) return

    // Backend rejeita remover dataVenda de proprietário já encerrado — espelhamos.
    const jaEstavaEncerrado = Boolean(proprietario.dataVenda)
    if (jaEstavaEncerrado && !values.dataVenda) {
      const msg = 'Não é permitido remover a data de venda de um proprietário já encerrado.'
      setErros((e) => ({ ...e, dataVenda: msg }))
      refs.dataVenda?.current?.focus()
      return
    }

    const payload = {
      nomeCompleto: values.nomeCompleto,
      cpf: values.cpf,
      dataVenda: values.dataVenda || null,
      observacao: values.observacao.trim() || null,
    }

    const schema = criarAtualizarProprietarioSchema({
      dataAquisicao: proprietario.dataAquisicao,
    })
    const resultado = schema.safeParse(payload)
    if (!resultado.success) {
      const novos: CamposProprietarioErros = {}
      for (const issue of resultado.error.issues) {
        const campo = issue.path[0]
        if (
          typeof campo === 'string' &&
          (campo === 'nomeCompleto' ||
            campo === 'cpf' ||
            campo === 'observacao' ||
            campo === 'dataVenda') &&
          !novos[campo]
        ) {
          novos[campo] = issue.message
        }
      }
      setErros(novos)
      focarPrimeiro(novos)
      return
    }

    mutation.mutate(resultado.data, {
      onSuccess: () => {
        const encerrou = !jaEstavaEncerrado && !!payload.dataVenda
        toast.show({
          variant: 'success',
          title: encerrou ? 'Posse encerrada' : 'Proprietário atualizado',
        })
        onFechar()
      },
      onError: (err) => {
        toast.show({
          variant: 'error',
          title: 'Não foi possível salvar as alterações',
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
      title="Editar proprietário"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={fechar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-editar-proprietario" loading={enviando}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <form id="form-editar-proprietario" onSubmit={handleSubmit} noValidate>
        <CamposProprietario
          values={values}
          erros={erros}
          onChange={setCampo}
          disabled={enviando}
          mostrarDataVenda
          dataAquisicaoISO={proprietario?.dataAquisicao?.slice(0, 10)}
          refs={refs}
        />
      </form>
    </Modal>
  )
}
