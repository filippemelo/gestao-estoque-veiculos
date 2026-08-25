import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

// Hook para segurar a navegação enquanto houver alterações não salvas.
// Combina duas coisas:
//  - useBlocker do react-router para navegações internas (Link, navigate),
//    devolvendo um estado "blocked" que o componente usa para pedir confirmação.
//  - beforeunload nativo para fechamento da aba / reload do navegador.
//
// Uso ref pra o callback do useBlocker enxergar o valor mais recente sem
// depender do fechamento de render.
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
    // do useEffect que sincroniza o ref, e o Modal "Descartar alterações?"
    // aparece indevidamente.
    liberar: () => {
      bloquearRef.current = false
    },
  }
}
