import type { ZodError } from 'zod'
import { fromError } from 'zod-validation-error'

// Reduz ZodError a { 'campo': 'mensagem', 'novoProprietario.cpf': '...' }.
// Se um mesmo campo tiver várias issues, mantém a primeira (mais específica).
export function coletarErrosPorCampo(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of err.issues) {
    const chave = issue.path.map((p) => String(p)).join('.') || '_root'
    if (!(chave in out)) out[chave] = issue.message
  }
  return out
}

export function formatarMensagemGeral(err: ZodError): string {
  return fromError(err, { prefix: 'Dados inválidos', prefixSeparator: ': ' }).message
}
