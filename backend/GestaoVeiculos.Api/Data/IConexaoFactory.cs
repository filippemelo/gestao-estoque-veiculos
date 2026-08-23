using Oracle.ManagedDataAccess.Client;

namespace GestaoVeiculos.Api.Data;

public interface IConexaoFactory
{
    OracleConnection CriarConexao();
}