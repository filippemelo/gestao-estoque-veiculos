// Página TEMPORÁRIA de demonstração dos schemas Zod (Etapa 3).
// Roda vários casos válidos e inválidos ao montar, imprime no console e
// exibe o resultado em tela. Será removida em breve.

import { useMemo } from 'react'

import { Badge } from '@/components/ui'
import { coletarErrosPorCampo, formatarMensagemGeral } from '@/schemas/errors'
import { criarAtualizarProprietarioSchema, criarProprietarioSchema } from '@/schemas/proprietario'
import { atualizarVeiculoSchema, criarVeiculoSchema } from '@/schemas/veiculo'

type Caso = {
  titulo: string
  esperado: 'valido' | 'invalido'
  resultado:
    | { ok: true; dados: unknown }
    | { ok: false; erros: Record<string, string>; geral: string }
}

function rodar<S extends { safeParse: (v: unknown) => { success: true; data: unknown } | { success: false; error: import('zod').ZodError } }>(
  schema: S,
  titulo: string,
  esperado: 'valido' | 'invalido',
  input: unknown,
): Caso {
  const parsed = schema.safeParse(input)
  if (parsed.success) {
    return { titulo, esperado, resultado: { ok: true, dados: parsed.data } }
  }
  return {
    titulo,
    esperado,
    resultado: {
      ok: false,
      erros: coletarErrosPorCampo(parsed.error),
      geral: formatarMensagemGeral(parsed.error),
    },
  }
}

function useCasos(): Caso[] {
  return useMemo(() => {
    const casos: Caso[] = []

    // ---------- Criar veículo ----------
    casos.push(
      rodar(criarVeiculoSchema, 'Criar veículo — válido', 'valido', {
        marca: 'Chevrolet',
        modelo: 'Onix Plus LT 1.0 Turbo',
        ano: 2023,
        cor: 'Prata',
        preco: 89990,
        tipo: 'Sedan',
        placa: 'ABC-1234',
        quilometragem: 32450,
      }),
    )

    casos.push(
      rodar(criarVeiculoSchema, 'Criar veículo — inválido (vários campos)', 'invalido', {
        marca: '',
        modelo: '',
        ano: 3000,
        cor: '',
        preco: -1,
        tipo: 'Van',
        placa: 'XX-99',
        quilometragem: -5,
      }),
    )

    // ---------- Atualizar veículo ----------
    casos.push(
      rodar(atualizarVeiculoSchema, 'Atualizar veículo — Disponível → ok', 'valido', {
        marca: 'Jeep',
        modelo: 'Compass Longitude 1.3 T270',
        ano: 2022,
        cor: 'Preto',
        preco: 154900,
        tipo: 'SUV',
        situacao: 'Disponível',
        quilometragem: 48120,
      }),
    )

    casos.push(
      rodar(
        atualizarVeiculoSchema,
        'Atualizar veículo — Vendido sem novoProprietario (deve falhar)',
        'invalido',
        {
          marca: 'Jeep',
          modelo: 'Compass',
          ano: 2022,
          cor: 'Preto',
          preco: 154900,
          tipo: 'SUV',
          situacao: 'Vendido',
          quilometragem: 48120,
        },
      ),
    )

    casos.push(
      rodar(
        atualizarVeiculoSchema,
        'Atualizar veículo — Vendido com novoProprietario válido',
        'valido',
        {
          marca: 'Jeep',
          modelo: 'Compass',
          ano: 2022,
          cor: 'Preto',
          preco: 154900,
          tipo: 'SUV',
          situacao: 'Vendido',
          quilometragem: 48120,
          novoProprietario: {
            nomeCompleto: 'Ana Souza Ferreira',
            cpf: '123.456.789-01',
            observacao: 'Comprou à vista',
          },
        },
      ),
    )

    casos.push(
      rodar(
        atualizarVeiculoSchema,
        'Atualizar veículo — Vendido com CPF inválido no novo proprietário',
        'invalido',
        {
          marca: 'Jeep',
          modelo: 'Compass',
          ano: 2022,
          cor: 'Preto',
          preco: 154900,
          tipo: 'SUV',
          situacao: 'Vendido',
          quilometragem: 48120,
          novoProprietario: {
            nomeCompleto: 'Ana',
            cpf: '123',
            observacao: null,
          },
        },
      ),
    )

    // ---------- Criar proprietário ----------
    casos.push(
      rodar(criarProprietarioSchema, 'Criar proprietário — válido', 'valido', {
        veiculoId: 1,
        nomeCompleto: 'João da Silva',
        cpf: '12345678901',
        observacao: null,
      }),
    )

    casos.push(
      rodar(criarProprietarioSchema, 'Criar proprietário — CPF mal formatado', 'invalido', {
        veiculoId: 1,
        nomeCompleto: 'João da Silva',
        cpf: '123.456.789.01',
        observacao: null,
      }),
    )

    // ---------- Atualizar proprietário (factory com dataAquisicao) ----------
    const dataAquisicao = new Date(2024, 0, 15) // 15/jan/2024, local
    const schemaAtualizarProp = criarAtualizarProprietarioSchema({ dataAquisicao })

    casos.push(
      rodar(schemaAtualizarProp, 'Atualizar proprietário — sem dataVenda (válido)', 'valido', {
        nomeCompleto: 'João da Silva',
        cpf: '123.456.789-01',
        observacao: 'Ainda proprietário',
      }),
    )

    casos.push(
      rodar(
        schemaAtualizarProp,
        'Atualizar proprietário — dataVenda ANTERIOR à aquisição (deve falhar)',
        'invalido',
        {
          nomeCompleto: 'João da Silva',
          cpf: '12345678901',
          dataVenda: '2023-12-31',
        },
      ),
    )

    casos.push(
      rodar(
        schemaAtualizarProp,
        'Atualizar proprietário — dataVenda FUTURA (deve falhar)',
        'invalido',
        {
          nomeCompleto: 'João da Silva',
          cpf: '12345678901',
          dataVenda: '2099-01-01',
        },
      ),
    )

    casos.push(
      rodar(
        schemaAtualizarProp,
        'Atualizar proprietário — dataVenda dentro do intervalo permitido',
        'valido',
        {
          nomeCompleto: 'João da Silva',
          cpf: '12345678901',
          dataVenda: '2024-06-01',
        },
      ),
    )

    // Loga tudo no console para conferência rápida.
    console.groupCollapsed('[schemas-demo] resultados')
    for (const c of casos) {
      const status = c.resultado.ok ? 'OK' : 'FAIL'
      const bateu = c.esperado === (c.resultado.ok ? 'valido' : 'invalido') ? '✓' : '✗'
      console.log(`${bateu} [${status}] ${c.titulo}`, c.resultado)
    }
    console.groupEnd()

    return casos
  }, [])
}

export function SchemasDemoPage() {
  const casos = useCasos()

  const totalBateu = casos.filter(
    (c) => c.esperado === (c.resultado.ok ? 'valido' : 'invalido'),
  ).length

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Demo — Schemas Zod</h1>
        <p className="text-sm text-slate-600">
          Página temporária. {totalBateu}/{casos.length} casos com o resultado esperado. Abra o
          console para o dump completo.
        </p>
      </header>

      <ul className="space-y-3">
        {casos.map((c) => (
          <li
            key={c.titulo}
            className="rounded-md border border-border-subtle bg-white p-3 text-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={c.resultado.ok ? 'success' : 'danger'}>
                {c.resultado.ok ? 'Válido' : 'Inválido'}
              </Badge>
              <Badge variant="neutral">esperado: {c.esperado}</Badge>
              <span className="font-medium text-slate-800">{c.titulo}</span>
            </div>

            {c.resultado.ok ? (
              <pre className="overflow-auto rounded bg-slate-50 p-2 text-xs">
                {JSON.stringify(c.resultado.dados, null, 2)}
              </pre>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Geral: {c.resultado.geral}</p>
                <table className="w-full border-collapse text-xs">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="w-1/3 py-1 pr-2">Campo</th>
                      <th className="py-1">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {Object.entries(c.resultado.erros).map(([campo, msg]) => (
                      <tr key={campo}>
                        <td className="py-1 pr-2 font-mono text-slate-700">{campo}</td>
                        <td className="py-1 text-danger-700">{msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
