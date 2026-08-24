using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Data.Mappers;
using GestaoVeiculos.Api.Domain.Entities;
using Oracle.ManagedDataAccess.Client;

namespace GestaoVeiculos.Api.Repositories;

public class VeiculoRepository(ConexaoFactory conexaoFactory) : IVeiculoRepository
{
    private readonly ConexaoFactory _conexaoFactory = conexaoFactory;

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

    public Task InserirVeiculoAsync(Veiculo veiculo)
    {
        throw new NotImplementedException();
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