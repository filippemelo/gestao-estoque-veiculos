import { z } from 'zod'

import { situacaoSchema, tipoSchema } from './enums'

// Placa: mesmo regex do backend — antigo (ABC1234/ABC-1234) ou Mercosul (ABC1D23).
const PLACA_REGEX = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/

const anoAtual = () => new Date().getFullYear()

const marcaField = z
  .string()
  .trim()
  .min(1, 'Informe a marca.')
  .max(50, 'Marca deve ter no máximo 50 caracteres.')

const modeloField = z
  .string()
  .trim()
  .min(1, 'Informe o modelo.')
  .max(100, 'Modelo deve ter no máximo 100 caracteres.')

const corField = z
  .string()
  .trim()
  .min(1, 'Informe a cor.')
  .max(30, 'Cor deve ter no máximo 30 caracteres.')

const anoField = z
  .number({ error: 'Informe o ano.' })
  .int('Ano deve ser um número inteiro.')
  .min(1900, 'Ano deve ser 1900 ou posterior.')
  .refine((v) => v <= anoAtual(), {
    error: () => `Ano não pode ser maior que ${anoAtual()}.`,
  })

const precoField = z
  .number({ error: 'Informe o preço.' })
  .min(0, 'Preço deve ser maior ou igual a zero.')
  .max(99_999_999.99, 'Preço deve ser no máximo 99.999.999,99.')

const quilometragemField = z
  .number({ error: 'Informe a quilometragem.' })
  .int('Quilometragem deve ser um número inteiro.')
  .min(0, 'Quilometragem deve ser maior ou igual a zero.')

const placaField = z
  .string()
  .trim()
  .min(1, 'Informe a placa.')
  .max(10, 'Placa deve ter no máximo 10 caracteres.')
  .regex(PLACA_REGEX, 'Placa deve estar no formato ABC-1234 ou ABC1D23 (Mercosul).')

const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/

export const novoProprietarioSchema = z.object({
  nomeCompleto: z
    .string()
    .trim()
    .min(1, 'Informe o nome completo.')
    .max(100, 'Nome completo deve ter no máximo 100 caracteres.'),
  cpf: z
    .string()
    .trim()
    .min(1, 'Informe o CPF.')
    .regex(CPF_REGEX, 'CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos.'),
  observacao: z
    .string()
    .trim()
    .max(255, 'Observação deve ter no máximo 255 caracteres.')
    .optional()
    .nullable(),
})

// POST /veiculos não recebe `situacao` — o backend força "Disponível".
export const criarVeiculoSchema = z.object({
  marca: marcaField,
  modelo: modeloField,
  ano: anoField,
  cor: corField,
  preco: precoField,
  tipo: tipoSchema,
  placa: placaField,
  quilometragem: quilometragemField,
})

// PUT /veiculos/{id} não recebe `placa` (imutável). Se `situacao === "Vendido"`,
// `novoProprietario` passa a ser obrigatório e seus campos internos são validados.
export const atualizarVeiculoSchema = z
  .object({
    marca: marcaField,
    modelo: modeloField,
    ano: anoField,
    cor: corField,
    preco: precoField,
    tipo: tipoSchema,
    situacao: situacaoSchema,
    quilometragem: quilometragemField,
    novoProprietario: novoProprietarioSchema.optional().nullable(),
  })
  .superRefine((valor, ctx) => {
    if (valor.situacao !== 'Vendido') return
    if (!valor.novoProprietario) {
      ctx.addIssue({
        code: 'custom',
        path: ['novoProprietario'],
        message: 'Ao marcar como Vendido, informe o novo proprietário.',
      })
    }
  })

export type CriarVeiculoInput = z.infer<typeof criarVeiculoSchema>
export type AtualizarVeiculoInput = z.infer<typeof atualizarVeiculoSchema>
export type NovoProprietarioInput = z.infer<typeof novoProprietarioSchema>
