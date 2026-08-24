import { useEffect, useState } from 'react'

// Segura `value` e só publica após `delayMs` sem novas atualizações.
// Zera o timer a cada mudança. Útil pra ligar inputs a queries sem
// disparar uma chamada a cada tecla.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
