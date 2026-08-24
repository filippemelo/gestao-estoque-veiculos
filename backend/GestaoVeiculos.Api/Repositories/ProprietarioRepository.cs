using System.Data;
using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Data.Mappers;
using GestaoVeiculos.Api.Domain.Entities;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;

namespace GestaoVeiculos.Api.Repositories;

public class ProprietarioRepository(IConexaoFactory conexaoFactory) : IProprietarioRepository
{
    private readonly IConexaoFactory _conexaoFactory = conexaoFactory;

    public Task<IEnumerable<Proprietario>> ListarProprietariosAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<Proprietario>> ListarPorVeiculoAsync(int veiculoId)
    {
        const string sql = """
                           SELECT ID, VEICULO_ID, NOME_COMPLETO, CPF, DATA_AQUISICAO, DATA_VENDA, OBSERVACAO
                           FROM PROPRIETARIO
                           WHERE VEICULO_ID = :veiculoId
                           ORDER BY DATA_AQUISICAO ASC
                           """;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("veiculoId", OracleDbType.Int32) { Value = veiculoId });

            await using var reader = await cmd.ExecuteReaderAsync();

            var proprietarios = new List<Proprietario>();
            while (await reader.ReadAsync())
                proprietarios.Add(ProprietarioMapper.MapearProprietario(reader));

            return proprietarios;
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task<bool> ExisteProprietarioVeiculoAsync(int veiculoId)
    {
        const string sql = """
                           SELECT 1 FROM PROPRIETARIO
                           WHERE VEICULO_ID = :veiculoId
                           FETCH FIRST 1 ROW ONLY
                           """;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("veiculoId", OracleDbType.Int32) { Value = veiculoId });

            var resultado = await cmd.ExecuteScalarAsync();

            return resultado is not null;
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task<bool> ExisteProprietarioAtualPorVeiculoAsync(int veiculoId)
    {
        const string sql = """
                           SELECT 1 FROM PROPRIETARIO
                           WHERE VEICULO_ID = :veiculoId AND DATA_VENDA IS NULL
                           FETCH FIRST 1 ROW ONLY
                           """;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("veiculoId", OracleDbType.Int32) { Value = veiculoId });

            var resultado = await cmd.ExecuteScalarAsync();

            return resultado is not null;
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task<Proprietario?> ObterProprietarioAsync(int id)
    {
        const string sql = """
                           SELECT ID, VEICULO_ID, NOME_COMPLETO, CPF, DATA_AQUISICAO, DATA_VENDA, OBSERVACAO
                           FROM PROPRIETARIO
                           WHERE ID = :id
                           """;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("id", OracleDbType.Int32) { Value = id });

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return ProprietarioMapper.MapearProprietario(reader);
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task AtualizarProprietarioAsync(Proprietario proprietario)
    {
        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            AplicarUpdateProprietario(cmd, proprietario);

            await cmd.ExecuteNonQueryAsync();
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task AtualizarEEncerrarAtualAsync(Proprietario proprietario, Veiculo veiculoVendido)
    {
        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var transacao = (OracleTransaction)await conexao.BeginTransactionAsync();

            await using (var cmdProprietario = conexao.CreateCommand())
            {
                cmdProprietario.Transaction = transacao;
                AplicarUpdateProprietario(cmdProprietario, proprietario);
                await cmdProprietario.ExecuteNonQueryAsync();
            }

            await using (var cmdVeiculo = conexao.CreateCommand())
            {
                cmdVeiculo.Transaction = transacao;
                cmdVeiculo.BindByName = true;
                cmdVeiculo.CommandText = "UPDATE VEICULO SET SITUACAO = :situacao WHERE ID = :id";
                cmdVeiculo.Parameters.Add(new OracleParameter("situacao", OracleDbType.Varchar2) { Value = veiculoVendido.Situacao });
                cmdVeiculo.Parameters.Add(new OracleParameter("id", OracleDbType.Int32) { Value = veiculoVendido.Id });
                await cmdVeiculo.ExecuteNonQueryAsync();
            }

            await transacao.CommitAsync();
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    private static void AplicarUpdateProprietario(OracleCommand cmd, Proprietario proprietario)
    {
        cmd.BindByName = true;
        cmd.CommandText = """
                          UPDATE PROPRIETARIO
                          SET NOME_COMPLETO = :nomeCompleto,
                              CPF = :cpf,
                              DATA_VENDA = :dataVenda,
                              OBSERVACAO = :observacao
                          WHERE ID = :id
                          """;

        cmd.Parameters.Add(new OracleParameter("nomeCompleto", OracleDbType.Varchar2) { Value = proprietario.NomeCompleto });
        cmd.Parameters.Add(new OracleParameter("cpf", OracleDbType.Varchar2) { Value = proprietario.Cpf });
        cmd.Parameters.Add(new OracleParameter("dataVenda", OracleDbType.Date)
        {
            Value = (object?)proprietario.DataVenda ?? DBNull.Value
        });
        cmd.Parameters.Add(new OracleParameter("observacao", OracleDbType.Varchar2)
        {
            Value = (object?)proprietario.Observacao ?? DBNull.Value
        });
        cmd.Parameters.Add(new OracleParameter("id", OracleDbType.Int32) { Value = proprietario.Id });
    }

    public async Task<int> InserirProprietarioAsync(Proprietario proprietario)
    {
        const string sql = """
                           INSERT INTO PROPRIETARIO
                               (VEICULO_ID, NOME_COMPLETO, CPF, DATA_AQUISICAO, OBSERVACAO)
                           VALUES
                               (:veiculoId, :nomeCompleto, :cpf, :dataAquisicao, :observacao)
                           RETURNING ID INTO :id
                           """;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("veiculoId", OracleDbType.Int32) { Value = proprietario.VeiculoId });
            cmd.Parameters.Add(new OracleParameter("nomeCompleto", OracleDbType.Varchar2) { Value = proprietario.NomeCompleto });
            cmd.Parameters.Add(new OracleParameter("cpf", OracleDbType.Varchar2) { Value = proprietario.Cpf });
            cmd.Parameters.Add(new OracleParameter("dataAquisicao", OracleDbType.Date) { Value = proprietario.DataAquisicao });
            cmd.Parameters.Add(new OracleParameter("observacao", OracleDbType.Varchar2)
            {
                Value = (object?)proprietario.Observacao ?? DBNull.Value
            });

            var idParam = new OracleParameter("id", OracleDbType.Int32) { Direction = ParameterDirection.Output };
            cmd.Parameters.Add(idParam);

            await cmd.ExecuteNonQueryAsync();

            return ((OracleDecimal)idParam.Value).ToInt32();
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task RemoverProprietarioAsync(int id)
    {
        const string sql = "DELETE FROM PROPRIETARIO WHERE ID = :id";

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("id", OracleDbType.Int32) { Value = id });

            await cmd.ExecuteNonQueryAsync();
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }
}
