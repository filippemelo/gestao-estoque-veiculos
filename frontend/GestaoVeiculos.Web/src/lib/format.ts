const NBSP = ' '

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const inteiro = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const dataCurta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatarMoedaBRL(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  return moeda.format(valor)
}

export function formatarQuilometragem(km: number | null | undefined): string {
  if (km === null || km === undefined || Number.isNaN(km)) return '—'
  return `${inteiro.format(km)}${NBSP}km`
}

export function formatarInteiro(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  return inteiro.format(valor)
}

// Aceita string ISO do backend ("2026-08-24T00:00:00") ou Date.
export function formatarData(valor: string | Date | null | undefined): string {
  if (valor === null || valor === undefined || valor === '') return '—'
  const d = typeof valor === 'string' ? new Date(valor) : valor
  if (Number.isNaN(d.getTime())) return '—'
  return dataCurta.format(d)
}

// Devolve o valor original quando o formato é inválido — não estraga o dado.
export function formatarCPF(cpf: string | null | undefined): string {
  if (!cpf) return '—'
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) return cpf
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
}

// Insere hífen no formato antigo (ABC-1234); Mercosul (ABC1D23) fica sem hífen.
export function formatarPlaca(placa: string | null | undefined): string {
  if (!placa) return '—'
  const bruta = placa.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (bruta.length !== 7) return placa.toUpperCase()
  const c4 = bruta[3]
  const c5 = bruta[4]
  const eMercosul = /[A-Z]/.test(c5 ?? '')
  if (eMercosul) return bruta
  if (/\d/.test(c4 ?? '')) return `${bruta.slice(0, 3)}-${bruta.slice(3)}`
  return bruta
}
