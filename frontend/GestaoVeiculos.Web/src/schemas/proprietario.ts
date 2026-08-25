import { z } from 'zod'

const CPF_REGEX = /^(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/
const DATA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/

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

// POST /proprietarios não recebe `dataAquisicao` — o backend usa DateTime.Today.
export const criarProprietarioSchema = z.object({
  veiculoId: z
    .number({ error: 'Informe o veículo.' })
    .int('Id do veículo deve ser inteiro.')
    .positive('Id do veículo deve ser positivo.'),
  nomeCompleto: nomeCompletoField,
  cpf: cpfField,
  observacao: observacaoField,
})

// Compara puramente por data-calendário (T00:00:00 elimina o fuso).
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

// Factory: recebe a dataAquisicao (imutável no backend) e devolve o schema
// já com o refinamento cruzado — não faz parte do payload enviado.
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
      if (Number.isNaN(venda.getTime())) return

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

// Fixado aqui porque a factory devolve schemas diferentes por instância.
export type AtualizarProprietarioInput = {
  nomeCompleto: string
  cpf: string
  dataVenda?: string | null
  observacao?: string | null
}

export type CriarProprietarioInput = z.infer<typeof criarProprietarioSchema>
