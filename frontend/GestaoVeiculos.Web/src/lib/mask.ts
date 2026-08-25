export function mascararCPF(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// Só insere hífen quando o 4º caractere é dígito (formato antigo).
// Mercosul (ABC1D23) fica sem hífen.
export function mascararPlaca(valor: string): string {
  const bruto = valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
  if (bruto.length <= 3) return bruto
  const quartoChar = bruto[3]
  const eAntigo = quartoChar !== undefined && /\d/.test(quartoChar)
  if (bruto.length === 7 && eAntigo && /^\d{4}$/.test(bruto.slice(3))) {
    return `${bruto.slice(0, 3)}-${bruto.slice(3)}`
  }
  return bruto
}

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}
