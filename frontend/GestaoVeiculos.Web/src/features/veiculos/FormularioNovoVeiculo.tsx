import type { FormEvent } from 'react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError } from '@/api/http'
import type { Tipo } from '@/api/types'
import { TIPOS } from '@/api/types'
import {
  BadgeSituacao,
  Button,
  Field,
  Input,
  InputMoedaBRL,
  Select,
  useToast,
} from '@/components/ui'
import { mascararPlaca } from '@/lib/mask'
import { criarVeiculoSchema } from '@/schemas/veiculo'

import { useCriarVeiculoMutation } from './hooks/useCriarVeiculoMutation'

// Estado local do formulário. Usa string / '' onde o input pode estar vazio,
// e o Zod (no submit) reclama por "Informe X" para os campos obrigatórios.
type FormValues = {
  marca: string
  modelo: string
  ano: number | ''
  cor: string
  preco: number | ''
  tipo: Tipo | ''
  placa: string
  quilometragem: number | ''
}

type CampoTexto = 'marca' | 'modelo' | 'cor' | 'placa'
type CampoNumerico = 'ano' | 'preco' | 'quilometragem'
type Campo = keyof FormValues

// Ordem física do formulário — usada para focar no primeiro erro após submit.
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
  preco: '',
  tipo: '',
  placa: '',
  quilometragem: '',
}

type Erros = Partial<Record<Campo, string>>

export function FormularioNovoVeiculo() {
  const navigate = useNavigate()
  const toast = useToast()
  const mutation = useCriarVeiculoMutation()

  const [values, setValues] = useState<FormValues>(VALORES_INICIAIS)
  const [erros, setErros] = useState<Erros>({})

  const refs: Record<Campo, React.RefObject<HTMLInputElement | HTMLSelectElement | null>> = {
    marca: useRef<HTMLInputElement>(null),
    modelo: useRef<HTMLInputElement>(null),
    ano: useRef<HTMLInputElement>(null),
    cor: useRef<HTMLInputElement>(null),
    preco: useRef<HTMLInputElement>(null),
    tipo: useRef<HTMLSelectElement>(null),
    placa: useRef<HTMLInputElement>(null),
    quilometragem: useRef<HTMLInputElement>(null),
  }

  function setCampo<K extends Campo>(campo: K, valor: FormValues[K]) {
    setValues((v) => ({ ...v, [campo]: valor }))
    // Se havia erro naquele campo, limpa ao começar a corrigir.
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
        refs[campo].current?.focus()
        return
      }
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (mutation.isPending) return // evita duplo submit

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
        // A API retorna o id — vamos direto para o detalhe.
        navigate(`/veiculos/${veiculo.id}`)
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          // Placa duplicada é o único 409 do POST /veiculos.
          setErros((prev) => ({ ...prev, placa: err.message }))
          refs.placa.current?.focus()
          return
        }
        const mensagem = err instanceof Error ? err.message : String(err)
        toast.show({
          variant: 'error',
          title: 'Não foi possível salvar o veículo',
          description: mensagem,
        })
      },
    })
  }

  const enviando = mutation.isPending

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="rounded-md border border-primary-100 bg-primary-50 p-3 text-sm text-primary-900">
        Ao salvar, o veículo será cadastrado com a situação{' '}
        <BadgeSituacao situacao="Disponível" className="ml-1" />.
      </div>

      <div className="grid gap-4 rounded-md border border-border-subtle bg-white p-4 md:grid-cols-2">
        <Field label="Placa" required error={erros.placa} hint="ABC-1234 ou ABC1D23 (Mercosul)">
          {(p) => (
            <Input
              {...p}
              ref={refs.placa as React.RefObject<HTMLInputElement>}
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

        {renderCampoTexto('marca', 'Marca', 'Ex.: Chevrolet')}
        {renderCampoTexto('modelo', 'Modelo', 'Ex.: Onix Plus LT 1.0 Turbo')}
        {renderCampoNumericoInteiro('ano', 'Ano')}
        {renderCampoTexto('cor', 'Cor', 'Ex.: Prata')}

        <Field label="Tipo" required error={erros.tipo}>
          {(p) => (
            <Select
              {...p}
              ref={refs.tipo as React.RefObject<HTMLSelectElement>}
              value={values.tipo}
              onChange={(e) => setCampo('tipo', e.target.value as Tipo | '')}
              onBlur={() => validarCampo('tipo')}
              disabled={enviando}
              invalid={Boolean(erros.tipo)}
            >
              <option value="">Selecione…</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Preço (R$)" required error={erros.preco}>
          {(p) => (
            <InputMoedaBRL
              {...p}
              ref={refs.preco as React.RefObject<HTMLInputElement>}
              value={values.preco}
              onChange={(v) => setCampo('preco', v)}
              onBlur={() => validarCampo('preco')}
              disabled={enviando}
              invalid={Boolean(erros.preco)}
            />
          )}
        </Field>

        {renderCampoNumericoInteiro('quilometragem', 'Quilometragem (km)')}
      </div>

      <div className="flex justify-end gap-2">
        <Link to="/veiculos">
          <Button variant="secondary" disabled={enviando} type="button">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" loading={enviando}>
          Salvar veículo
        </Button>
      </div>
    </form>
  )

  function renderCampoTexto(campo: CampoTexto, label: string, placeholder?: string) {
    return (
      <Field label={label} required error={erros[campo]}>
        {(p) => (
          <Input
            {...p}
            ref={refs[campo] as React.RefObject<HTMLInputElement>}
            value={values[campo]}
            placeholder={placeholder}
            onChange={(e) => setCampo(campo, e.target.value)}
            onBlur={() => validarCampo(campo)}
            disabled={enviando}
            invalid={Boolean(erros[campo])}
          />
        )}
      </Field>
    )
  }

  function renderCampoNumericoInteiro(campo: CampoNumerico, label: string) {
    return (
      <Field label={label} required error={erros[campo]}>
        {(p) => (
          <Input
            {...p}
            ref={refs[campo] as React.RefObject<HTMLInputElement>}
            type="number"
            inputMode="numeric"
            numeric
            value={values[campo] === '' ? '' : String(values[campo])}
            onChange={(e) => {
              const v = e.target.value
              setCampo(campo, v === '' ? '' : Number(v))
            }}
            onBlur={() => validarCampo(campo)}
            disabled={enviando}
            invalid={Boolean(erros[campo])}
          />
        )}
      </Field>
    )
  }
}
