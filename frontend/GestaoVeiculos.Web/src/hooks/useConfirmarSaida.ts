import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

export function useConfirmarSaida(deveBloquear: boolean) {
  const bloquearRef = useRef(deveBloquear)
  useEffect(() => {
    bloquearRef.current = deveBloquear
  }, [deveBloquear])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      bloquearRef.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!deveBloquear) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Alguns navegadores ainda exigem returnValue para exibir o prompt.
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [deveBloquear])

  return {
    estaBloqueado: blocker.state === 'blocked',
    confirmarSaida: () => blocker.proceed?.(),
    cancelarSaida: () => blocker.reset?.(),
    // Libera o bloqueio SÍNCRONAMENTE. Necessário quando o consumidor vai
    // salvar e navegar no mesmo tick: sem isso, o navigate acontece antes
    // do useEffect sincronizar o ref e o Modal aparece indevidamente.
    liberar: () => {
      bloquearRef.current = false
    },
  }
}
