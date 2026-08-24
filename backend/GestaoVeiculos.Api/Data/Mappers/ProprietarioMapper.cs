using GestaoVeiculos.Api.Domain.Entities;
using Oracle.ManagedDataAccess.Client;

namespace GestaoVeiculos.Api.Data.Mappers;

public static class ProprietarioMapper
{
    public static Proprietario MapearProprietario(OracleDataReader reader)
    {
        var iDataVenda  = reader.GetOrdinal("DATA_VENDA");
        var iObservacao = reader.GetOrdinal("OBSERVACAO");

        return Proprietario.Reconstituir(
            id:            reader.GetInt32(reader.GetOrdinal("ID")),
            veiculoId:     reader.GetInt32(reader.GetOrdinal("VEICULO_ID")),
            nomeCompleto:  reader.GetString(reader.GetOrdinal("NOME_COMPLETO")),
            cpf:           reader.GetString(reader.GetOrdinal("CPF")),
            dataAquisicao: reader.GetDateTime(reader.GetOrdinal("DATA_AQUISICAO")),
            // SEM o IsDBNull, ler uma coluna nula lança InvalidCastException
            dataVenda:     reader.IsDBNull(iDataVenda)  ? null : reader.GetDateTime(iDataVenda),
            observacao:    reader.IsDBNull(iObservacao) ? null : reader.GetString(iObservacao)
        );
    }
}