# Respostas - Questões Técnicas

## Questão 1 - Conexão e Gerenciamento de Recursos

No projeto eu abro a conexão dentro de cada método do repositório e deixo o `await using` cuidar do fechamento. A conexão é criada por uma fábrica (`ConexaoFactory`) que é registrada como singleton no `Program.cs`, mas a `OracleConnection` em si é sempre nova e vive só o tempo da operação. Não guardo conexão em campo da classe justamente para não correr risco de ficar segurando conexão aberta entre requisições.

Usei `await using` no lugar de um `try/finally` com `Dispose()` manual porque faz a mesma coisa e fica bem mais limpo: ao sair do método, a conexão volta para o pool. Se eu não fechasse, cada requisição ia deixar uma conexão presa e o pool logo estouraria.

Exemplo direto do `VeiculoRepository.ObterVeiculoAsync`:

```csharp
await using var conexao = _conexaoFactory.CriarConexao();
await conexao.OpenAsync();

await using var cmd = conexao.CreateCommand();
cmd.BindByName = true;
cmd.CommandText = sql;

cmd.Parameters.Add(new OracleParameter("id", OracleDbType.Int32) { Value = id });

await using var reader = await cmd.ExecuteReaderAsync();
```

Os três recursos (`OracleConnection`, `OracleCommand` e `OracleDataReader`) implementam `IDisposable`, então todos levam `await using`. Se eu esquecesse do reader, o cursor no Oracle ficaria aberto até o GC passar por ali, e eu correria o risco de estourar o limite de cursores da sessão.

Uma coisa que eu poderia melhorar: no `ListarVeiculosAsync` eu faço duas idas ao banco (o `COUNT` e o `SELECT` paginado). Dá para juntar em uma só usando `COUNT(*) OVER()`, mas preferi manter separado por legibilidade.

## Questão 2 - Segurança nas Queries

SQL Injection é quando um valor vindo do usuário é concatenado direto na string da query, e esse valor contém trechos de SQL que o banco acaba executando como se fossem parte da instrução original. O caso clássico é o `WHERE nome = '` + input + `'`: se o input for `x' OR '1'='1`, o filtro deixa de filtrar. Em cenários piores dá para encerrar a instrução, adicionar um `DROP`, ler dados de outras tabelas com `UNION SELECT`, etc.

No projeto não é concatenação valor de usuário na query. Todo parâmetro entra como `OracleParameter` com nome (`:algumaCoisa`) e ainda com tipo declarado (`OracleDbType.Varchar2`, `Int32`, `Date`...). Deixo `cmd.BindByName = true` porque o Oracle, sem isso, faz o bind por posição.

O caso mais interessante desse ponto no projeto é a listagem de veículos, porque ali a query é dinâmica: dependendo dos filtros que o usuário passa, o `WHERE` cresce. Só pra ilustrar o risco, se eu tivesse feito na correria ficaria mais ou menos assim (esse código abaixo NÃO está no projeto, é só pra mostrar o problema):

```csharp
var where = "";
if (!string.IsNullOrWhiteSpace(pageOption.Marca))
    where += $" AND UPPER(MARCA) LIKE UPPER('{pageOption.Marca}%')";
if (!string.IsNullOrWhiteSpace(pageOption.Situacao))
    where += $" AND SITUACAO = '{pageOption.Situacao}'";
var sql = "SELECT ... FROM VEICULO WHERE 1=1" + where;
```

Aí bastaria alguém chamar `GET /veiculos?situacao=Vendido' OR '1'='1` para escapar do filtro. Pior: com uma placa contendo aspa simples a query já quebraria sozinha.

O que eu fiz de verdade, em [VeiculoRepository.cs:16-83](backend/GestaoVeiculos.Api/Repositories/VeiculoRepository.cs#L16-L83), foi montar só a _estrutura_ do `WHERE` dinamicamente e passar os valores como parâmetros:

```csharp
if (!string.IsNullOrWhiteSpace(pageOption.Marca))
{
    where.Append(where.Length == 0 ? " WHERE " : " AND ");
    where.Append("UPPER(MARCA) LIKE UPPER(:marca) || '%'");
    filtros.Add(new OracleParameter("marca", OracleDbType.Varchar2) { Value = pageOption.Marca });
}
```

O valor `pageOption.Marca` nunca é interpolado na string do SQL, ele viaja pelo protocolo como parâmetro tipado. Mesmo que venha `x' OR '1'='1`, o Oracle vai tratar isso literalmente como texto para o `LIKE`, e o resultado é simplesmente "nenhum veículo com marca começada por essa string".

Além disso, as `CHECK constraints` no `create_tables.sql` (situação, preço, quilometragem, ano) funcionam como segunda linha de defesa contra dados inválidos. Não substituem parametrização, mas é bom ter.

## Questão 3 - Relacionamento entre Tabelas

No banco, `PROPRIETARIO` tem uma FK apontando para `VEICULO`:

```sql
CONSTRAINT FK_PROPRIETARIO_VEICULO
    FOREIGN KEY (VEICULO_ID)
    REFERENCES VEICULO (ID)
```

De propósito eu não coloquei `ON DELETE CASCADE`. Se o usuário tenta apagar um veículo que já tem histórico de proprietários, quase sempre é engano e não quero que o histórico de quem comprou o carro suma junto.

No C#, esse vínculo aparece de duas formas: a entidade `Proprietario` guarda só o `VeiculoId` (não deixei um objeto `Veiculo` inteiro dentro porque, com ADO.NET puro, montar esse grafo dá mais trabalho do que ajuda). E na hora de responder o `GET /veiculos/{id}`, o `VeiculoDetalheResponse` junta o veículo com a lista de proprietários, cada um vindo do seu próprio repositório.

Sobre a exclusão: a regra é aplicada na camada de serviço, em [VeiculoService.ExcluirVeiculoAsync](backend/GestaoVeiculos.Api/Services/VeiculoService.cs#L71-L83):

```csharp
if (await _proprietarioRepository.ExisteProprietarioVeiculoAsync(id))
    throw new ConflictException(
        $"Não é possível excluir o veículo {id}: existem proprietários cadastrados.");

await _veiculoRepository.RemoverVeiculoAsync(id);
```

O `GlobalExceptionHandler` transforma essa `ConflictException` em um HTTP 409 com uma mensagem legível para o usuário final.

Deixei essa checagem no serviço por dois motivos. Primeiro, mensagem: se eu confiasse só no banco, o usuário receberia um `ORA-02292` no meio da tela, e isso é não legal. Segundo, é uma regra de negócio e faz mais sentido ela estar visível no `VeiculoService` do que escondida no DDL.

Sendo bem sincero, essa checagem tem uma brecha: entre eu checar que não tem proprietário e efetivamente apagar, alguém poderia inserir um. Se isso acontecer, a FK do banco barra e o `OracleExceptionTranslator` transforma no mesmo 409. Então na prática a FK acaba servindo de proteção extra caso a validação no serviço passe batido.

## Questão 4 - Transações

Se eu atualizasse a situação do veículo para `Vendido` e a inserção do novo proprietário falhasse depois, o veículo ficaria marcado como vendido sem ninguém associado à venda. Os dados iam ficar sem sentido: consultar o veículo mostraria "Vendido" mas o histórico não teria proprietário atual. Pior ainda se existisse um proprietário anterio, aí teria fechado a data de venda (`DATA_VENDA` preenchida) sem colocar novo proprietário no lugar. Ou seja, três operações que precisam ir juntas ou não ir de jeito nenhum.

A forma de tratar isso no ADO.NET é com `BeginTransactionAsync()` na conexão, e associar cada `OracleCommand` a essa transação via `cmd.Transaction = transacao`. No final, `CommitAsync()` confirma tudo; se qualquer coisa lançar exceção antes, o `await using` da transação faz o rollback automaticamente ao sair do escopo (isso é o comportamento padrão do `Dispose` de uma transação não commitada).

O trecho relevante está em [VeiculoRepository.AtualizarComVendaAsync](backend/GestaoVeiculos.Api/Repositories/VeiculoRepository.cs#L212-L274):

```csharp
await using var conexao = _conexaoFactory.CriarConexao();
await conexao.OpenAsync();

await using var transacao = (OracleTransaction)await conexao.BeginTransactionAsync();

await using (var cmdVeiculo = conexao.CreateCommand())
{
    cmdVeiculo.Transaction = transacao;
    AplicarUpdateVeiculo(cmdVeiculo, veiculo);
    await cmdVeiculo.ExecuteNonQueryAsync();
}

if (idProprietarioAtualAnterior is not null)
{
    await using var cmdEncerrar = conexao.CreateCommand();
    cmdEncerrar.Transaction = transacao;
    // ... UPDATE PROPRIETARIO SET DATA_VENDA ...
    await cmdEncerrar.ExecuteNonQueryAsync();
}

await using (var cmdInserir = conexao.CreateCommand())
{
    cmdInserir.Transaction = transacao;
    // ... INSERT INTO PROPRIETARIO ...
    await cmdInserir.ExecuteNonQueryAsync();
}

await transacao.CommitAsync();
```

Um detalhe: as três operações precisam rodar na mesma conexão, senão a transação não funciona. Por causa disso a lógica das três ficou junta no `VeiculoRepository`, mesmo uma delas mexendo na tabela `PROPRIETARIO`. Talvez ficaria melhor quebrar por repositório usando `TransactionScope`, mas ia trazer complicações com o driver Oracle que não valeriam a pena aqui.

O `Commit` só é chamado no fim, quando as três instruções deram certo. Se qualquer uma delas falhar, o `catch` pega a exceção, o `Dispose` da transação faz rollback automático, e a `OracleException` é traduzida para uma `DomainException` mais amigável.

## Questão 5 - Organização e Decisões de Projeto

O backend está organizado em quatro camadas:

- Endpoints (pasta `Endpoints/`): Minimal APIs que só fazem o mapeamento HTTP para serviço.
- Services (pasta `Services/`): regras de negócio, validação e coordenação entre os repositórios.
- Repositories (pasta `Repositories/`): acesso ao banco em ADO.NET puro (queries, parâmetros, transações).
- Data / Domain: `ConexaoFactory`, tradução de exceções Oracle, entidades e exceções de domínio.

Existe também uma pasta `Models/` separando `Requests`, `Responses` e `PageOptions`, e um `GlobalExceptionHandler` que centraliza a tradução das exceções de domínio para respostas HTTP.

Por que separar repositório do controller (ou endpoint, no meu caso)? Pra não juntar coisa que não tem a ver. O endpoint lida com `Request`, `Response` e status HTTP, e não precisa saber se por trás tem Oracle, SQL Server ou até um arquivo JSON. Quem cuida das regras de negócio (validar dados, checar duplicidade de placa, exigir novo proprietário quando o carro é vendido, etc) é o serviço, e o acesso ao banco fica todo no repositório.

Além da separação de responsabilidades, isso me deu outras vantagens práticas: quando precisou adicionar a transação da venda, mudei apenas o repositório e o serviço, sem tocar em endpoint ou request/response. E quando o serviço precisou de uma nova verificação (`ExisteProprietarioVeiculoAsync`), foi só criar o método no repositório correspondente. A interface `IProprietarioRepository` permite que amanhã eu troque a implementação por uma mock em testes, se quiser.

Se fosse refatorar hoje, algumas coisas eu mexeria.

A primeira é a duplicação nos repositórios: o bloco `await using var conexao = ...; await conexao.OpenAsync(); ... catch (OracleException ex) { throw OracleExceptionTranslator.Traduzir(ex); }` se repete em praticamente todo método. Daria pra criar uma classe utilitária (algo tipo `OracleExecutor`) que recebe uma `Func<OracleConnection, Task<T>>` e cuida da abertura, do `try/catch` e do dispose.

Outra coisa é a montagem manual dos parâmetros. Tem métodos com 8 ou 9 `cmd.Parameters.Add(...)` seguidos, e isso funciona, mas é meio frágil (fácil errar o tipo na hora).

Também não gosto muito da regra do "veículo vendido" ficar no `VeiculoService`. A validação "se vai marcar como Vendido, precisa vir novo proprietário" está lá funcionando, mas seria melhor se estivesse dentro da própria entidade `Veiculo`, algo tipo um método `MarcarComoVendido(Proprietario)` que já forçasse isso pra sempre valer. Do jeito que está, se amanhã alguém criar outro caminho de atualização pode acabar esquecendo dessa regra.

E por fim, aquele detalhe da listagem: no `ListarVeiculosAsync` eu faço duas idas ao banco (o `COUNT` e o `SELECT` paginado) que poderiam virar uma query só com `COUNT(*) OVER()`. Economiza um round-trip, e numa tela de estoque isso tem impacto visível.
