// Schemas de validação para o domínio Proprietário.
//
// Notas de contrato:
// - POST /proprietarios não recebe `dataAquisicao` (backend usa DateTime.Today).
// - Atualizar precisa da `dataAquisicao` original para validar que `dataVenda`
//   não seja anterior a ela. Como esse valor não faz parte do payload enviado
//   ao backend, o schema de atualizar é uma factory que recebe essa referência.

import { z } from 'zod'

const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/
const DATA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD, o formato do <input type="date">

const nomeCompletoField = z
  .string()
  .trim()
  .min(1, 'Informe o nome completo.')
  .max(100, 'Nome completo deve ter no máximo 100 caracteres.')

const cpfField = z
  .string()
  .trim()
  .min(1, 'Informe o CPF.')
  .regex(CPF_REGEX, 'CPF deve estar no formato 000.000.000-00 ou conter 11 dígitos.')

const observacaoField = z
  .string()
  .trim()
  .max(255, 'Observação deve ter no máximo 255 caracteres.')
  .optional()
  .nullable()

// -------------------- Criar --------------------
export const criarProprietarioSchema = z.object({
  veiculoId: z
    .number({ error: 'Informe o veículo.' })
    .int('Id do veículo deve ser inteiro.')
    .positive('Id do veículo deve ser positivo.'),
  nomeCompleto: nomeCompletoField,
  cpf: cpfField,
  observacao: observacaoField,
})

// -------------------- Atualizar --------------------
// O regex já garante YYYY-MM-DD; a comparação usa T00:00:00 para eliminar
// influência de fuso — comparação puramente por data-calendário.
function paraDataLocal(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

function hojeLocal(): Date {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

const dataVendaField = z
  .string()
  .trim()
  .regex(DATA_ISO_REGEX, 'Data de venda inválida (formato AAAA-MM-DD).')
  .optional()
  .nullable()

// Factory: recebe a dataAquisicao já conhecida (imutável no backend) e
// devolve o schema com o refinamento cruzado.
export function criarAtualizarProprietarioSchema(opts: {
  dataAquisicao: Date | string
}) {
  const dataAquisicao =
    typeof opts.dataAquisicao === 'string'
      ? new Date(opts.dataAquisicao)
      : opts.dataAquisicao

  return z
    .object({
      nomeCompleto: nomeCompletoField,
      cpf: cpfField,
      dataVenda: dataVendaField,
      observacao: observacaoField,
    })
    .superRefine((valor, ctx) => {
      if (!valor.dataVenda) return
      const venda = paraDataLocal(valor.dataVenda)
      if (Number.isNaN(venda.getTime())) return // regex já cobre; guarda extra.

      if (venda.getTime() < dataAquisicao.getTime()) {
        ctx.addIssue({
          code: 'custom',
          path: ['dataVenda'],
          message: 'Data de venda não pode ser anterior à data de aquisição.',
        })
        return
      }

      if (venda.getTime() > hojeLocal().getTime()) {
        ctx.addIssue({
          code: 'custom',
          path: ['dataVenda'],
          message: 'Data de venda não pode ser futura.',
        })
      }
    })
}

// Tipo inferido: como a factory devolve schemas diferentes por instância,
// o tipo do payload é fixado aqui para consumo externo.
export type AtualizarProprietarioInput = {
  nomeCompleto: string
  cpf: string
  dataVenda?: string | null
  observacao?: string | null
}

export type CriarProprietarioInput = z.infer<typeof criarProprietarioSchema>
