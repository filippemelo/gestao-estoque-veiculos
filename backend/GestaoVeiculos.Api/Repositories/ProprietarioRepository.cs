using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Data.Mappers;
using GestaoVeiculos.Api.Domain.Entities;
using Oracle.ManagedDataAccess.Client;

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

    public Task<Proprietario> ObterProprietarioAsync(int id)
    {
        throw new NotImplementedException();
    }

    public Task InserirProprietarioAsync(Proprietario proprietario)
    {
        throw new NotImplementedException();
    }

    public Task RemoverProprietarioAsync(int id)
    {
        throw new NotImplementedException();
    }
}
