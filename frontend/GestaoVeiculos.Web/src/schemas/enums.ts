import { z } from 'zod'

// Grafia (com acento) confirmada chamando o backend — precisa bater exatamente.
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
