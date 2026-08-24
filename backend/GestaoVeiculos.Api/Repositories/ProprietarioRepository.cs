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

    public Task<Proprietario> ObterProprietarioAsync(int id)
    {
        throw new NotImplementedException();
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

    public Task RemoverProprietarioAsync(int id)
    {
        throw new NotImplementedException();
    }
}
