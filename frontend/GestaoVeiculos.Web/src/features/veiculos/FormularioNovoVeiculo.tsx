import type { FormEvent } from 'react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError } from '@/api/http'
import { BadgeSituacao, Button, Field, Input, useToast } from '@/components/ui'
import { mascararPlaca } from '@/lib/mask'
import { criarVeiculoSchema } from '@/schemas/veiculo'

import type {
  CamposBaseVeiculoErros,
  CamposBaseVeiculoValues,
} from './CamposBaseVeiculo'
import { CamposBaseVeiculo } from './CamposBaseVeiculo'
import { useCriarVeiculoMutation } from './hooks/useCriarVeiculoMutation'

// Situação não aparece no cadastro — backend força "Disponível".
type FormValues = CamposBaseVeiculoValues & { placa: string }
type Campo = keyof FormValues
type Erros = Partial<Record<Campo, string>>

const ORDEM_CAMPOS: readonly Campo[] = [
  'placa',
  'marca',
  'modelo',
  'ano',
  'cor',
  'tipo',
  'preco',
  'quilometragem',
]

const VALORES_INICIAIS: FormValues = {
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  tipo: '',
  preco: '',
  placa: '',
  quilometragem: '',
}

export function FormularioNovoVeiculo() {
  const navigate = useNavigate()
  const toast = useToast()
  const mutation = useCriarVeiculoMutation()

  const [values, setValues] = useState<FormValues>(VALORES_INICIAIS)
  const [erros, setErros] = useState<Erros>({})

  const refPlaca = useRef<HTMLInputElement>(null)
  const refMarca = useRef<HTMLInputElement>(null)
  const refModelo = useRef<HTMLInputElement>(null)
  const refAno = useRef<HTMLInputElement>(null)
  const refCor = useRef<HTMLInputElement>(null)
  const refTipo = useRef<HTMLSelectElement>(null)
  const refPreco = useRef<HTMLInputElement>(null)
  const refKm = useRef<HTMLInputElement>(null)

  const refPorCampo: Record<Campo, React.RefObject<HTMLElement | null>> = {
    placa: refPlaca,
    marca: refMarca,
    modelo: refModelo,
    ano: refAno,
    cor: refCor,
    tipo: refTipo,
    preco: refPreco,
    quilometragem: refKm,
  }

  function setCampo<K extends Campo>(campo: K, valor: FormValues[K]) {
    setValues((v) => ({ ...v, [campo]: valor }))
    setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
  }

  function validarCampo(campo: Campo) {
    const parcial = criarVeiculoSchema.pick({ [campo]: true } as Record<Campo, true>)
    const resultado = parcial.safeParse({ [campo]: values[campo] })
    if (resultado.success) {
      setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
      return
    }
    const msg = resultado.error.issues.find((i) => i.path[0] === campo)?.message
    if (msg) setErros((e) => ({ ...e, [campo]: msg }))
  }

  function focarPrimeiroErro(errosNovos: Erros) {
    for (const campo of ORDEM_CAMPOS) {
      if (errosNovos[campo]) {
        refPorCampo[campo].current?.focus()
        return
      }
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (mutation.isPending) return

    const resultado = criarVeiculoSchema.safeParse(values)
    if (!resultado.success) {
      const novos: Erros = {}
      for (const issue of resultado.error.issues) {
        const campo = issue.path[0] as Campo | undefined
        if (campo && !novos[campo]) novos[campo] = issue.message
      }
      setErros(novos)
      focarPrimeiroErro(novos)
      return
    }

    mutation.mutate(resultado.data, {
      onSuccess: (veiculo) => {
        toast.show({ variant: 'success', title: 'Veículo salvo' })
        navigate(`/veiculos/${veiculo.id}`)
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          // Placa duplicada é o único 409 do POST /veiculos.
          setErros((prev) => ({ ...prev, placa: err.message }))
          refPlaca.current?.focus()
          return
        }
        toast.show({
          variant: 'error',
          title: 'Não foi possível salvar o veículo',
          description: err instanceof Error ? err.message : String(err),
        })
      },
    })
  }

  const enviando = mutation.isPending

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="rounded-lg border border-primary-100 bg-primary-50 p-3 text-sm text-primary-900">
        Ao salvar, o veículo será cadastrado com a situação{' '}
        <BadgeSituacao situacao="Disponível" className="ml-1" />.
      </div>

      <div className="grid gap-4 rounded-lg border border-border-subtle bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03] md:grid-cols-2">
        <Field label="Placa" required error={erros.placa} hint="ABC-1234 ou ABC1D23 (Mercosul)">
          {(p) => (
            <Input
              {...p}
              ref={refPlaca}
              value={values.placa}
              onChange={(e) => setCampo('placa', mascararPlaca(e.target.value))}
              onBlur={() => validarCampo('placa')}
              autoComplete="off"
              maxLength={10}
              className="uppercase"
              disabled={enviando}
              invalid={Boolean(erros.placa)}
            />
          )}
        </Field>

        <CamposBaseVeiculo
          values={values}
          erros={errosBase(erros)}
          onChange={(campo, valor) => setCampo(campo as Campo, valor as FormValues[Campo])}
          onBlurCampo={validarCampo}
          disabled={enviando}
          refs={{
            marca: refMarca,
            modelo: refModelo,
            ano: refAno,
            cor: refCor,
            tipo: refTipo,
            preco: refPreco,
            quilometragem: refKm,
          }}
          placeholders={{
            marca: 'Ex.: Chevrolet',
            modelo: 'Ex.: Onix Plus LT 1.0 Turbo',
            cor: 'Ex.: Prata',
          }}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2 border-t border-border-subtle pt-4">
        <Link to="/veiculos">
          <Button variant="secondary" disabled={enviando} type="button">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" loading={enviando}>
          <IconeSalvar />
          Salvar veículo
        </Button>
      </div>
    </form>
  )
}

function IconeSalvar() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

// Slice para o CamposBaseVeiculo (não passa `placa`).
function errosBase(e: Erros): CamposBaseVeiculoErros {
  return {
    marca: e.marca,
    modelo: e.modelo,
    ano: e.ano,
    cor: e.cor,
    tipo: e.tipo,
    preco: e.preco,
    quilometragem: e.quilometragem,
  }
}
