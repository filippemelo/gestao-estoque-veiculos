using Oracle.ManagedDataAccess.Client;

namespace GestaoVeiculos.Api.Data;

public class ConexaoFactory(IConfiguration configuration) : IConexaoFactory
{
    private readonly string _connectionString = 
        configuration.GetConnectionString("DefaultConnection") 
        ?? throw new InvalidOperationException("Connection string não configurada.");
    
    public OracleConnection CriarConexao()
    {
        return new OracleConnection(_connectionString);
    }
}