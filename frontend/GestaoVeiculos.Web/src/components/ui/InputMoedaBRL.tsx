import type { Ref } from 'react'
import { useState } from 'react'

import { Input } from './Input'

type Props = {
  value: number | ''
  onChange: (v: number | '') => void
  id?: string
  invalid?: boolean
  disabled?: boolean
  placeholder?: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  'aria-describedby'?: string
  ref?: Ref<HTMLInputElement>
}

const formatador = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatar(valor: number | ''): string {
  if (valor === '' || Number.isNaN(valor)) return ''
  return formatador.format(valor)
}

export function InputMoedaBRL({ value, onChange, ...rest }: Props) {
  const [texto, setTexto] = useState(() => formatar(value))

  // Reflete mudanças externas de `value` (reset do form) sem useEffect —
  // padrão setState-durante-render com guard.
  const [ultimoValue, setUltimoValue] = useState(value)
  if (value !== ultimoValue) {
    setUltimoValue(value)
    setTexto(formatar(value))
  }

  return (
    <Input
      inputMode="numeric"
      numeric
      value={texto}
      placeholder="0,00"
      onChange={(e) => {
        const digitos = e.target.value.replace(/\D/g, '')
        if (digitos === '') {
          setTexto('')
          onChange('')
          return
        }
        // Acumula em centavos para evitar erros de ponto flutuante.
        const centavos = Number(digitos.slice(0, 12))
        const valor = centavos / 100
        setTexto(formatar(valor))
        onChange(valor)
      }}
      {...rest}
    />
  )
}
