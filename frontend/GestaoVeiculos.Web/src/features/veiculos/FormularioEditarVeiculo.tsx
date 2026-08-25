import type { FormEvent } from 'react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import type { Situacao, Tipo, Veiculo } from '@/api/types'
import { SITUACOES, TIPOS } from '@/api/types'
import {
  BadgeSituacao,
  Button,
  ConfirmDialog,
  Field,
  Input,
  Select,
  useToast,
} from '@/components/ui'
import type {
  CamposProprietarioErros,
  CamposProprietarioValues,
} from '@/features/proprietarios/CamposProprietario'
import { CamposProprietario } from '@/features/proprietarios/CamposProprietario'
import { useConfirmarSaida } from '@/hooks/useConfirmarSaida'
import { formatarPlaca } from '@/lib/format'
import { atualizarVeiculoSchema } from '@/schemas/veiculo'

import type {
  CamposBaseVeiculoErros,
  CamposBaseVeiculoValues,
} from './CamposBaseVeiculo'
import { CamposBaseVeiculo } from './CamposBaseVeiculo'
import { useAtualizarVeiculoMutation } from './hooks/useAtualizarVeiculoMutation'

// -------------------- Modelo de formulário --------------------
type NovoProprietarioForm = {
  nomeCompleto: string
  cpf: string
  observacao: string
}

type FormValues = CamposBaseVeiculoValues & {
  situacao: Situacao
  novoProprietario: NovoProprietarioForm | null
}

type Campo = keyof CamposBaseVeiculoValues | 'situacao'

// Ordem física do formulário — usada para focar o primeiro erro no submit.
const ORDEM_CAMPOS: readonly string[] = [
  'marca',
  'modelo',
  'ano',
  'cor',
  'tipo',
  'preco',
  'quilometragem',
  'situacao',
  'novoProprietario',
  'novoProprietario.nomeCompleto',
  'novoProprietario.cpf',
  'novoProprietario.observacao',
]

type Erros = Partial<Record<string, string>>

function ehSituacao(v: string): v is Situacao {
  return (SITUACOES as readonly string[]).includes(v)
}

function novoProprietarioVazio(): NovoProprietarioForm {
  return { nomeCompleto: '', cpf: '', observacao: '' }
}

// -------------------- Componente --------------------
export function FormularioEditarVeiculo({ veiculoInicial }: { veiculoInicial: Veiculo }) {
  const navigate = useNavigate()
  const toast = useToast()
  const mutation = useAtualizarVeiculoMutation(veiculoInicial.id)

  const situacaoInicial: Situacao = ehSituacao(veiculoInicial.situacao)
    ? veiculoInicial.situacao
    : 'Disponível'

  const [values, setValues] = useState<FormValues>(() => ({
    marca: veiculoInicial.marca,
    modelo: veiculoInicial.modelo,
    ano: veiculoInicial.ano,
    cor: veiculoInicial.cor,
    preco: veiculoInicial.preco,
    tipo: (TIPOS as readonly string[]).includes(veiculoInicial.tipo)
      ? (veiculoInicial.tipo as Tipo)
      : '',
    situacao: situacaoInicial,
    quilometragem: veiculoInicial.quilometragem,
    // Se o veículo já veio como "Vendido", preciso revelar a seção mesmo
    // assim — backend exige novoProprietario em toda gravação com Vendido.
    novoProprietario: situacaoInicial === 'Vendido' ? novoProprietarioVazio() : null,
  }))
  const [erros, setErros] = useState<Erros>({})

  // "Sujo" com ref (útil pro useBlocker enxergar o valor mais atual antes
  // do navigate) + state (pra UI refletir).
  const [dirty, setDirty] = useState(false)
  const dirtyRef = useRef(false)
  function marcarSujo() {
    if (!dirtyRef.current) {
      dirtyRef.current = true
      setDirty(true)
    }
  }
  function limparSujo() {
    dirtyRef.current = false
    setDirty(false)
  }

  const { estaBloqueado, confirmarSaida, cancelarSaida } = useConfirmarSaida(dirty)

  // Refs para focar no primeiro erro.
  const refMarca = useRef<HTMLInputElement>(null)
  const refModelo = useRef<HTMLInputElement>(null)
  const refAno = useRef<HTMLInputElement>(null)
  const refCor = useRef<HTMLInputElement>(null)
  const refTipo = useRef<HTMLSelectElement>(null)
  const refPreco = useRef<HTMLInputElement>(null)
  const refKm = useRef<HTMLInputElement>(null)
  const refSituacao = useRef<HTMLSelectElement>(null)
  const refNovoPropNome = useRef<HTMLInputElement>(null)
  const refNovoPropCpf = useRef<HTMLInputElement>(null)
  const refNovoPropObs = useRef<HTMLTextAreaElement>(null)

  const refPorCampo: Record<string, React.RefObject<HTMLElement | null>> = {
    marca: refMarca,
    modelo: refModelo,
    ano: refAno,
    cor: refCor,
    tipo: refTipo,
    preco: refPreco,
    quilometragem: refKm,
    situacao: refSituacao,
    // Erro no bloco inteiro aponta para o primeiro campo da seção.
    novoProprietario: refNovoPropNome,
    'novoProprietario.nomeCompleto': refNovoPropNome,
    'novoProprietario.cpf': refNovoPropCpf,
    'novoProprietario.observacao': refNovoPropObs,
  }

  // -------------------- Setters --------------------
  function setCampo<K extends Campo>(campo: K, valor: FormValues[K]) {
    setValues((v) => ({ ...v, [campo]: valor }))
    marcarSujo()
    setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
  }

  function setSituacao(nova: Situacao) {
    setValues((v) => ({
      ...v,
      situacao: nova,
      novoProprietario: nova === 'Vendido' ? novoProprietarioVazio() : null,
    }))
    marcarSujo()
    setErros((e) => {
      const novos: Erros = { ...e, situacao: undefined }
      if (nova !== 'Vendido') {
        for (const k of Object.keys(novos)) {
          if (k === 'novoProprietario' || k.startsWith('novoProprietario.')) {
            delete novos[k]
          }
        }
      }
      return novos
    })
  }

  function setNovoProprietarioCampo<K extends keyof NovoProprietarioForm>(
    campo: K,
    valor: NovoProprietarioForm[K],
  ) {
    setValues((v) => ({
      ...v,
      novoProprietario:
        v.novoProprietario === null
          ? { ...novoProprietarioVazio(), [campo]: valor }
          : { ...v.novoProprietario, [campo]: valor },
    }))
    marcarSujo()
    const chaveErro = `novoProprietario.${campo}`
    setErros((e) => (e[chaveErro] ? { ...e, [chaveErro]: undefined } : e))
  }

  // -------------------- Validação --------------------
  function focarPrimeiroErro(errosNovos: Erros) {
    for (const chave of ORDEM_CAMPOS) {
      if (errosNovos[chave]) {
        refPorCampo[chave]?.current?.focus()
        return
      }
    }
  }

  function validarCampoRaiz(campo: Campo) {
    // Passamos o objeto inteiro para o schema aplicar cross-refinements.
    const parcial = atualizarVeiculoSchema.safeParse(paraPayload(values))
    if (parcial.success) {
      setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))
      return
    }
    const msg = parcial.error.issues.find((i) => i.path.length === 1 && i.path[0] === campo)?.message
    setErros((e) => ({ ...e, [campo]: msg }))
  }

  function paraPayload(v: FormValues) {
    // O schema (e o backend) só aceitam novoProprietario quando situacao === 'Vendido'.
    // Fora disso, garantimos que ele não vá no payload (evita "sujeira" do usuário
    // que digitou algo, mudou a situação e voltou).
    if (v.situacao !== 'Vendido') {
      return {
        marca: v.marca,
        modelo: v.modelo,
        ano: v.ano,
        cor: v.cor,
        preco: v.preco,
        tipo: v.tipo,
        situacao: v.situacao,
        quilometragem: v.quilometragem,
      }
    }
    return {
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      cor: v.cor,
      preco: v.preco,
      tipo: v.tipo,
      situacao: v.situacao,
      quilometragem: v.quilometragem,
      novoProprietario: v.novoProprietario
        ? {
            nomeCompleto: v.novoProprietario.nomeCompleto,
            cpf: v.novoProprietario.cpf,
            observacao: v.novoProprietario.observacao || null,
          }
        : null,
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (mutation.isPending) return

    const payload = paraPayload(values)
    const resultado = atualizarVeiculoSchema.safeParse(payload)
    if (!resultado.success) {
      const novos: Erros = {}
      for (const issue of resultado.error.issues) {
        const chave = issue.path.map((p) => String(p)).join('.') || '_root'
        if (!novos[chave]) novos[chave] = issue.message
      }
      setErros(novos)
      focarPrimeiroErro(novos)
      return
    }

    mutation.mutate(resultado.data, {
      onSuccess: () => {
        toast.show({ variant: 'success', title: 'Alterações salvas' })
        // Libera o blocker antes de sair da rota, senão o Modal aparece.
        limparSujo()
        navigate(`/veiculos/${veiculoInicial.id}`)
      },
      onError: (err) => {
        toast.show({
          variant: 'error',
          title: 'Não foi possível salvar as alterações',
          description: err instanceof Error ? err.message : String(err),
        })
      },
    })
  }

  const enviando = mutation.isPending

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 rounded-md border border-border-subtle bg-white p-4 md:grid-cols-2">
          <Field label="Placa" hint="A placa não pode ser alterada após o cadastro.">
            {(p) => (
              <Input
                {...p}
                value={formatarPlaca(veiculoInicial.placa)}
                readOnly
                className="num uppercase"
                aria-readonly
              />
            )}
          </Field>

          <CamposBaseVeiculo
            values={values}
            erros={errosBase(erros)}
            onChange={(campo, valor) => setCampo(campo as Campo, valor as FormValues[Campo])}
            onBlurCampo={(campo) => validarCampoRaiz(campo as Campo)}
            disabled={enviando}
            refs={{
              marca: refMarca,
              modelo: refModelo,
              ano: refAno,
              cor: refCor,
              tipo: refTipo,
              preco: refPreco,
              quilometragem: refKm,
            }}
          />

          <Field label="Situação" required error={erros.situacao}>
            {(p) => (
              <Select
                {...p}
                ref={refSituacao}
                value={values.situacao}
                onChange={(e) => setSituacao(e.target.value as Situacao)}
                onBlur={() => validarCampoRaiz('situacao')}
                disabled={enviando}
                invalid={Boolean(erros.situacao)}
              >
                {SITUACOES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        {values.situacao === 'Vendido' ? (
          <section
            aria-label="Dados do novo proprietário"
            className="space-y-3 rounded-md border border-primary-200 bg-primary-50/40 p-4"
          >
            <header className="text-sm text-primary-900">
              Como a situação foi marcada como{' '}
              <BadgeSituacao situacao="Vendido" />, é obrigatório registrar o novo
              proprietário. A venda será salva na mesma operação.
              {erros.novoProprietario ? (
                <span className="mt-1 block text-danger-700">{erros.novoProprietario}</span>
              ) : null}
            </header>

            <CamposProprietario
              values={valoresCamposProprietario(values.novoProprietario)}
              erros={errosCamposProprietario(erros)}
              onChange={(campo, valor) =>
                setNovoProprietarioCampo(
                  campo as 'nomeCompleto' | 'cpf' | 'observacao',
                  valor as string,
                )
              }
              disabled={enviando}
              refs={{
                nomeCompleto: refNovoPropNome,
                cpf: refNovoPropCpf,
                observacao: refNovoPropObs,
              }}
            />
          </section>
        ) : null}

        <div className="flex justify-end gap-2">
          <Link to={`/veiculos/${veiculoInicial.id}`}>
            <Button variant="secondary" type="button" disabled={enviando}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" loading={enviando}>
            Salvar alterações
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={estaBloqueado}
        title="Descartar alterações?"
        description="Há alterações não salvas. Se sair agora, elas serão perdidas."
        confirmLabel="Descartar e sair"
        cancelLabel="Continuar editando"
        variant="danger"
        onConfirm={confirmarSaida}
        onCancel={cancelarSaida}
      />
    </>
  )
}

// -------------------- Adaptadores --------------------
// Slice do objeto de erros para o CamposBaseVeiculo (só campos comuns).
function errosBase(e: Erros): CamposBaseVeiculoErros {
  return {
    marca: e.marca,
    modelo: e.modelo,
    ano: e.ano,
    cor: e.cor,
    tipo: e.tipo,
    preco: e.preco,
    quilometragem: e.quilometragem,
  }
}

// Adaptadores para o CamposProprietario. A venda não tem dataVenda (backend
// usa hoje); ficamos com string vazia para cumprir o contrato do componente.
function valoresCamposProprietario(
  np: { nomeCompleto: string; cpf: string; observacao: string } | null,
): CamposProprietarioValues {
  return {
    nomeCompleto: np?.nomeCompleto ?? '',
    cpf: np?.cpf ?? '',
    observacao: np?.observacao ?? '',
    dataVenda: '',
  }
}

function errosCamposProprietario(erros: Erros): CamposProprietarioErros {
  return {
    nomeCompleto: erros['novoProprietario.nomeCompleto'],
    cpf: erros['novoProprietario.cpf'],
    observacao: erros['novoProprietario.observacao'],
  }
}
