using System.Data;
using System.Text;
using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Data.Mappers;
using GestaoVeiculos.Api.Domain.Entities;
using GestaoVeiculos.Api.Models.PageOptions;
using Oracle.ManagedDataAccess.Client;
using Oracle.ManagedDataAccess.Types;

namespace GestaoVeiculos.Api.Repositories;

public class VeiculoRepository(IConexaoFactory conexaoFactory) : IVeiculoRepository
{
    private readonly IConexaoFactory _conexaoFactory = conexaoFactory;

    public async Task<(IEnumerable<Veiculo> Itens, int Total)> ListarVeiculosAsync(ListarVeiculosPageOption pageOption)
    {
        var where = new StringBuilder();
        var filtros = new List<OracleParameter>();

        if (!string.IsNullOrWhiteSpace(pageOption.Marca))
        {
            where.Append(where.Length == 0 ? " WHERE " : " AND ");
            where.Append("UPPER(MARCA) LIKE UPPER(:marca) || '%'");
            filtros.Add(new OracleParameter("marca", OracleDbType.Varchar2) { Value = pageOption.Marca });
        }

        if (!string.IsNullOrWhiteSpace(pageOption.Situacao))
        {
            where.Append(where.Length == 0 ? " WHERE " : " AND ");
            where.Append("SITUACAO = :situacao");
            filtros.Add(new OracleParameter("situacao", OracleDbType.Varchar2) { Value = pageOption.Situacao });
        }

        var sqlCount = $"SELECT COUNT(*) FROM VEICULO{where}";
        var sqlItens = $"""
                        SELECT ID, MARCA, MODELO, ANO, COR, PRECO, TIPO, SITUACAO, PLACA, QUILOMETRAGEM
                        FROM VEICULO
                        {where}
                        ORDER BY ID
                        OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY
                        """;

        var offset = (pageOption.Page - 1) * pageOption.PageSize;

        try
        {
            await using var conexao = _conexaoFactory.CriarConexao();
            await conexao.OpenAsync();

            await using var cmdCount = conexao.CreateCommand();
            cmdCount.BindByName = true;
            cmdCount.CommandText = sqlCount;
            foreach (var p in filtros)
                cmdCount.Parameters.Add(Clonar(p));

            var totalObj = await cmdCount.ExecuteScalarAsync();
            var total = Convert.ToInt32(totalObj);

            if (total == 0)
                return (Array.Empty<Veiculo>(), 0);

            await using var cmdItens = conexao.CreateCommand();
            cmdItens.BindByName = true;
            cmdItens.CommandText = sqlItens;
            foreach (var p in filtros)
                cmdItens.Parameters.Add(Clonar(p));
            cmdItens.Parameters.Add(new OracleParameter("offset", OracleDbType.Int32) { Value = offset });
            cmdItens.Parameters.Add(new OracleParameter("pageSize", OracleDbType.Int32) { Value = pageOption.PageSize });

            await using var reader = await cmdItens.ExecuteReaderAsync();

            var itens = new List<Veiculo>();
            while (await reader.ReadAsync())
                itens.Add(VeiculoMapper.MapearVeiculo(reader));

            return (itens, total);
        }
        catch (OracleException ex)
        {
            throw OracleExceptionTranslator.Traduzir(ex);
        }
    }

    private static OracleParameter Clonar(OracleParameter origem) =>
        new(origem.ParameterName, origem.OracleDbType) { Value = origem.Value };

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

    public async Task RemoverVeiculoAsync(int id)
    {
        const string sql = "DELETE FROM VEICULO WHERE ID = :id";

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