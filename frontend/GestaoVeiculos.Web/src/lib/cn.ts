// Helper mínimo para concatenar classNames condicionais.
// Aceita strings, undefined, false e objetos {classe: boolean}.
export type ClassValue = string | number | null | undefined | false | Record<string, boolean>

export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  for (const value of values) {
    if (!value) continue
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value))
      continue
    }
    for (const [key, active] of Object.entries(value)) {
      if (active) out.push(key)
    }
  }
  return out.join(' ')
}
