import type { RefObject } from 'react'

import type { Tipo } from '@/api/types'
import { TIPOS } from '@/api/types'
import { Field, Input, InputMoedaBRL, Select } from '@/components/ui'

// Placa e Situação ficam fora — cada formulário os monta em volta,
// porque têm comportamento diferente (placa editável/readonly, situação só na edição).

export type CamposBaseVeiculoValues = {
  marca: string
  modelo: string
  ano: number | ''
  cor: string
  tipo: Tipo | ''
  preco: number | ''
  quilometragem: number | ''
}

export type CamposBaseVeiculoErros = Partial<
  Record<keyof CamposBaseVeiculoValues, string>
>

export type CamposBaseVeiculoRefs = Partial<{
  marca: RefObject<HTMLInputElement | null>
  modelo: RefObject<HTMLInputElement | null>
  ano: RefObject<HTMLInputElement | null>
  cor: RefObject<HTMLInputElement | null>
  tipo: RefObject<HTMLSelectElement | null>
  preco: RefObject<HTMLInputElement | null>
  quilometragem: RefObject<HTMLInputElement | null>
}>

type Props = {
  values: CamposBaseVeiculoValues
  erros?: CamposBaseVeiculoErros
  onChange: <K extends keyof CamposBaseVeiculoValues>(
    campo: K,
    valor: CamposBaseVeiculoValues[K],
  ) => void
  onBlurCampo?: (campo: keyof CamposBaseVeiculoValues) => void
  disabled?: boolean
  refs?: CamposBaseVeiculoRefs
  placeholders?: Partial<Record<'marca' | 'modelo' | 'cor', string>>
}

export function CamposBaseVeiculo({
  values,
  erros = {},
  onChange,
  onBlurCampo,
  disabled,
  refs,
  placeholders,
}: Props) {
  const blur = (campo: keyof CamposBaseVeiculoValues) => () => onBlurCampo?.(campo)

  return (
    <>
      {renderTexto('marca', 'Marca', placeholders?.marca)}
      {renderTexto('modelo', 'Modelo', placeholders?.modelo)}
      {renderNumericoInteiro('ano', 'Ano')}
      {renderTexto('cor', 'Cor', placeholders?.cor)}

      <Field label="Tipo" required error={erros.tipo}>
        {(p) => (
          <Select
            {...p}
            ref={refs?.tipo}
            value={values.tipo}
            onChange={(e) => onChange('tipo', e.target.value as Tipo | '')}
            onBlur={blur('tipo')}
            disabled={disabled}
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
            ref={refs?.preco}
            value={values.preco}
            onChange={(v) => onChange('preco', v)}
            onBlur={blur('preco')}
            disabled={disabled}
            invalid={Boolean(erros.preco)}
          />
        )}
      </Field>

      {renderNumericoInteiro('quilometragem', 'Quilometragem (km)')}
    </>
  )

  function renderTexto(campo: 'marca' | 'modelo' | 'cor', label: string, placeholder?: string) {
    return (
      <Field label={label} required error={erros[campo]}>
        {(p) => (
          <Input
            {...p}
            ref={refs?.[campo]}
            value={values[campo]}
            placeholder={placeholder}
            onChange={(e) => onChange(campo, e.target.value)}
            onBlur={blur(campo)}
            disabled={disabled}
            invalid={Boolean(erros[campo])}
          />
        )}
      </Field>
    )
  }

  function renderNumericoInteiro(campo: 'ano' | 'quilometragem', label: string) {
    const placeholderPadrao =
      campo === 'ano' ? String(new Date().getFullYear()) : '0'
    return (
      <Field label={label} required error={erros[campo]}>
        {(p) => (
          <Input
            {...p}
            ref={refs?.[campo]}
            type="number"
            inputMode="numeric"
            numeric
            placeholder={placeholderPadrao}
            value={values[campo] === '' ? '' : String(values[campo])}
            onChange={(e) => {
              const v = e.target.value
              onChange(campo, v === '' ? '' : Number(v))
            }}
            onBlur={blur(campo)}
            disabled={disabled}
            invalid={Boolean(erros[campo])}
          />
        )}
      </Field>
    )
  }
}
