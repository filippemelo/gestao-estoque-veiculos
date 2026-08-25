import type { RefObject } from 'react'

import { Field, Input, Textarea } from '@/components/ui'
import { formatarData } from '@/lib/format'
import { mascararCPF } from '@/lib/mask'

// `dataVenda` no formato YYYY-MM-DD do <input type="date">; '' quando vazio.
export type CamposProprietarioValues = {
  nomeCompleto: string
  cpf: string
  observacao: string
  dataVenda: string
}

export type CamposProprietarioErros = Partial<
  Record<keyof CamposProprietarioValues, string>
>

export type CamposProprietarioRefs = Partial<{
  nomeCompleto: RefObject<HTMLInputElement | null>
  cpf: RefObject<HTMLInputElement | null>
  observacao: RefObject<HTMLTextAreaElement | null>
  dataVenda: RefObject<HTMLInputElement | null>
}>

type Props = {
  values: CamposProprietarioValues
  erros?: CamposProprietarioErros
  onChange: <K extends keyof CamposProprietarioValues>(
    campo: K,
    valor: CamposProprietarioValues[K],
  ) => void
  disabled?: boolean
  // Cadastro pela venda transacional oculta este campo — backend preenche.
  mostrarDataVenda?: boolean
  dataAquisicaoISO?: string
  refs?: CamposProprietarioRefs
}

export function CamposProprietario({
  values,
  erros = {},
  onChange,
  disabled,
  mostrarDataVenda = false,
  dataAquisicaoISO,
  refs,
}: Props) {
  const hintDataVenda = mostrarDataVenda
    ? `Ao preencher a data de venda, a posse deste proprietário é encerrada.${
        dataAquisicaoISO
          ? ` Não pode ser anterior a ${formatarData(dataAquisicaoISO)}.`
          : ''
      }`
    : undefined

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nome completo" required error={erros.nomeCompleto}>
        {(p) => (
          <Input
            {...p}
            ref={refs?.nomeCompleto}
            value={values.nomeCompleto}
            onChange={(e) => onChange('nomeCompleto', e.target.value)}
            disabled={disabled}
            invalid={Boolean(erros.nomeCompleto)}
            autoComplete="off"
            maxLength={100}
          />
        )}
      </Field>

      <Field label="CPF" required error={erros.cpf} hint="000.000.000-00">
        {(p) => (
          <Input
            {...p}
            ref={refs?.cpf}
            value={values.cpf}
            onChange={(e) => onChange('cpf', mascararCPF(e.target.value))}
            disabled={disabled}
            invalid={Boolean(erros.cpf)}
            inputMode="numeric"
            autoComplete="off"
            maxLength={14}
            className="num"
          />
        )}
      </Field>

      {mostrarDataVenda ? (
        <Field label="Data de venda" error={erros.dataVenda} hint={hintDataVenda}>
          {(p) => (
            <Input
              {...p}
              ref={refs?.dataVenda}
              type="date"
              value={values.dataVenda}
              onChange={(e) => onChange('dataVenda', e.target.value)}
              disabled={disabled}
              invalid={Boolean(erros.dataVenda)}
              min={dataAquisicaoISO}
              max={new Date().toISOString().slice(0, 10)}
              className="num"
            />
          )}
        </Field>
      ) : null}

      <Field
        label="Observação"
        error={erros.observacao}
        className={mostrarDataVenda ? undefined : 'md:col-span-2'}
      >
        {(p) => (
          <Textarea
            {...p}
            ref={refs?.observacao}
            value={values.observacao}
            onChange={(e) => onChange('observacao', e.target.value)}
            disabled={disabled}
            invalid={Boolean(erros.observacao)}
            maxLength={255}
          />
        )}
      </Field>
    </div>
  )
}
