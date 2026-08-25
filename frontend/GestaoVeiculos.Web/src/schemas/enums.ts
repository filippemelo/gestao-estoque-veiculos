// Enums do domínio.
// Os schemas Zod são a fonte da verdade — SITUACOES/TIPOS e os tipos
// derivados são exportados a partir daqui e re-exportados por
// src/api/types.ts para manter o consumo pelos módulos existentes.
//
// A grafia (com acento) foi confirmada na Etapa 1 chamando o backend.

import { z } from 'zod'

export const situacaoSchema = z.enum(['Disponível', 'Reservado', 'Vendido'], {
  error: 'Selecione a situação.',
})
export const tipoSchema = z.enum(['Hatch', 'Sedan', 'SUV', 'Picape'], {
  error: 'Selecione o tipo.',
})

export const SITUACOES = situacaoSchema.options
export const TIPOS = tipoSchema.options

export type Situacao = z.infer<typeof situacaoSchema>
export type Tipo = z.infer<typeof tipoSchema>
