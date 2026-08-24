using System.Data;
using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Data.Mappers;
using GestaoVeiculos.Api.Domain.Entities;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;

namespace GestaoVeiculos.Api.Repositories;

public class VeiculoRepository(IConexaoFactory conexaoFactory) : IVeiculoRepository
{
    private readonly IConexaoFactory _conexaoFactory = conexaoFactory;

    public Task<IEnumerable<Veiculo>> ListarVeiculosAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<Veiculo?> ObterVeiculoAsync(int id)
    {
        const string sql = """
                           SELECT ID, MARCA, MODELO, ANO, COR, PRECO, TIPO, SITUACAO, PLACA, QUILOMETRAGEM
                           FROM VEICULO
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

            return VeiculoMapper.MapearVeiculo(reader);
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task<Veiculo?> ObterVeiculoPorPlacaAsync(string placa)
    {
        const string sql = """
                           SELECT ID, MARCA, MODELO, ANO, COR, PRECO, TIPO, SITUACAO, PLACA, QUILOMETRAGEM
                           FROM VEICULO
                           WHERE PLACA = :placa
                           """;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("placa", OracleDbType.Varchar2) { Value = placa });

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return null;

            return VeiculoMapper.MapearVeiculo(reader);
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    public async Task<int> InserirVeiculoAsync(Veiculo veiculo)
    {
        const string sql = """
                           INSERT INTO VEICULO
                               (MARCA, MODELO, ANO, COR, PRECO, TIPO, SITUACAO, PLACA, QUILOMETRAGEM)
                           VALUES
                               (:marca, :modelo, :ano, :cor, :preco, :tipo, :situacao, :placa, :quilometragem)
                           RETURNING ID INTO :id
                           """;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmd = conexao.CreateCommand();
            cmd.BindByName = true;
            cmd.CommandText = sql;

            cmd.Parameters.Add(new OracleParameter("marca", OracleDbType.Varchar2) { Value = veiculo.Marca });
            cmd.Parameters.Add(new OracleParameter("modelo", OracleDbType.Varchar2) { Value = veiculo.Modelo });
            cmd.Parameters.Add(new OracleParameter("ano", OracleDbType.Int32) { Value = veiculo.Ano });
            cmd.Parameters.Add(new OracleParameter("cor", OracleDbType.Varchar2) { Value = veiculo.Cor });
            cmd.Parameters.Add(new OracleParameter("preco", OracleDbType.Decimal) { Value = veiculo.Preco });
            cmd.Parameters.Add(new OracleParameter("tipo", OracleDbType.Varchar2) { Value = veiculo.Tipo });
            cmd.Parameters.Add(new OracleParameter("situacao", OracleDbType.Varchar2) { Value = veiculo.Situacao });
            cmd.Parameters.Add(new OracleParameter("placa", OracleDbType.Varchar2) { Value = veiculo.Placa });
            cmd.Parameters.Add(new OracleParameter("quilometragem", OracleDbType.Int32) { Value = veiculo.Quilometragem });

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

    public Task AtualizarVeiculoAsync(Veiculo veiculo)
    {
        throw new NotImplementedException();
    }

    public Task RemoverVeiculoAsync(int id)
    {
        throw new NotImplementedException();
    }
}