import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui'

// Página de erro global — capturada pelo `errorElement` do router.
// Ativa quando uma tela lança durante renderização ou uma rota não pode
// ser carregada (ex.: chunk lazy-load falhou).
export function ErroInesperadoPage() {
  const err = useRouteError()

  const titulo = isRouteErrorResponse(err) ? `Erro ${err.status}` : 'Algo deu errado'
  const descricao = extrairDescricao(err)

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Erro inesperado
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">{titulo}</h1>
      </header>

      <div className="rounded-md border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
        <p>{descricao}</p>
      </div>

      <p className="text-sm text-slate-600">
        Recarregue a página. Se o problema continuar, avise a equipe responsável.
      </p>

      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
        <Link to="/veiculos">
          <Button variant="secondary">Ir para veículos</Button>
        </Link>
      </div>
    </div>
  )
}

function extrairDescricao(err: unknown): string {
  if (isRouteErrorResponse(err)) {
    if (typeof err.data === 'string' && err.data.trim() !== '') return err.data
    if (err.statusText) return err.statusText
    return 'Não foi possível concluir a operação.'
  }
  if (err instanceof Error && err.message) return err.message
  return 'Ocorreu uma falha inesperada ao renderizar esta tela.'
}
