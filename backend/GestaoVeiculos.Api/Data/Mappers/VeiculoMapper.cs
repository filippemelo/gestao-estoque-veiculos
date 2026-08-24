using GestaoVeiculos.Api.Domain.Entities;
using Oracle.ManagedDataAccess.Client;

namespace GestaoVeiculos.Api.Data.Mappers;

public static class VeiculoMapper
{
    public static Veiculo MapearVeiculo(OracleDataReader reader)
    {
        return Veiculo.Reconstituir(
            reader.GetInt32(reader.GetOrdinal("ID")),
            reader.GetString(reader.GetOrdinal("MARCA")),
            reader.GetString(reader.GetOrdinal("MODELO")),
            reader.GetInt32(reader.GetOrdinal("ANO")),
            reader.GetString(reader.GetOrdinal("COR")),
            reader.GetDecimal(reader.GetOrdinal("PRECO")),
            reader.GetString(reader.GetOrdinal("TIPO")),
            reader.GetString(reader.GetOrdinal("SITUACAO")),
            reader.GetString(reader.GetOrdinal("PLACA")),
            reader.GetInt32(reader.GetOrdinal("QUILOMETRAGEM"))
        );
    }
} 
  