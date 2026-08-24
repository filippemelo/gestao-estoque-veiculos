// Helpers para transformar ZodError em algo útil para formulários.

import type { ZodError } from 'zod'
import { fromError } from 'zod-validation-error'

// Reduz um ZodError para { 'campo': 'mensagem', 'novoProprietario.cpf': '...' }.
// Se um mesmo campo tiver várias issues, mantém a primeira (a mais específica
// costuma ser a primeira registrada pela cadeia de validação).
export function coletarErrosPorCampo(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of err.issues) {
    const chave = issue.path.map((p) => String(p)).join('.') || '_root'
    if (!(chave in out)) out[chave] = issue.message
  }
  return out
}

// Mensagem legível única (para toast/log geral). Usa zod-validation-error
// que já cuida da formatação em português quando as mensagens vêm em pt-BR.
export function formatarMensagemGeral(err: ZodError): string {
  return fromError(err, { prefix: 'Dados inválidos', prefixSeparator: ': ' }).message
}
