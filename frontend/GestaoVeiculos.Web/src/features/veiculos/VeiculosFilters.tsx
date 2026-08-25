import { useEffect, useState } from 'react'

import type { Situacao } from '@/api/types'
import { SITUACOES } from '@/api/types'
import { Button, Field, Input, Select } from '@/components/ui'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

import type { FiltrosVeiculos } from './hooks/useVeiculosFilters'

type Props = {
  filtros: FiltrosVeiculos
  onFiltrosChange: (next: Partial<Pick<FiltrosVeiculos, 'marca' | 'situacao'>>) => void
  onLimpar: () => void
  temFiltro: boolean
}

const DEBOUNCE_MS = 400

export function VeiculosFilters({ filtros, onFiltrosChange, onLimpar, temFiltro }: Props) {
  const [inputMarca, setInputMarca] = useState(filtros.marca)

  // Se a URL mudou por fora (limpar, back/forward), reflete no input imediatamente
  // via setState-durante-render — sem useEffect.
  const [marcaSincronizada, setMarcaSincronizada] = useState(filtros.marca)
  if (filtros.marca !== marcaSincronizada) {
    setMarcaSincronizada(filtros.marca)
    setInputMarca(filtros.marca)
  }

  const marcaDebounced = useDebouncedValue(inputMarca, DEBOUNCE_MS)

  useEffect(() => {
    if (marcaDebounced === filtros.marca) return
    onFiltrosChange({ marca: marcaDebounced })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marcaDebounced])

  return (
    <section
      aria-label="Filtros"
      className="grid gap-4 rounded-lg border border-border-subtle bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03] md:grid-cols-[1fr_1fr_auto]"
    >
      <Field label="Marca" hint="Filtro parcial. Aplica ao parar de digitar.">
        {(p) => (
          <Input
            placeholder="Ex.: Chevrolet"
            value={inputMarca}
            onChange={(e) => setInputMarca(e.target.value)}
            {...p}
          />
        )}
      </Field>

      <Field label="Situação">
        {(p) => (
          <Select
            value={filtros.situacao}
            onChange={(e) => onFiltrosChange({ situacao: e.target.value as Situacao | '' })}
            {...p}
          >
            <option value="">Todas</option>
            {SITUACOES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <div className="flex items-end">
        <Button variant="secondary" onClick={onLimpar} disabled={!temFiltro}>
          Limpar filtros
        </Button>
      </div>
    </section>
  )
}
