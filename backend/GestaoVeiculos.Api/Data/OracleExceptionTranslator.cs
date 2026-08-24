using GestaoVeiculos.Api.Domain.Exceptions;
using Oracle.ManagedDataAccess.Client;

namespace GestaoVeiculos.Api.Data;

public static class OracleExceptionTranslator
{
    public static DomainException Traduzir(OracleException ex)
    {
        return ex.Number switch
        {
            1     => new ConflictException(MensagemUnicidade(ex)),
            2290  => new ValidationException(MensagemCheck(ex)),
            2291  => new ValidationException("Referência inválida: o registro relacionado não existe."),
            2292  => new ConflictException("Não é possível remover: existem registros vinculados a este item."),
            1400  => new ValidationException("Campo obrigatório não informado."),
            12154 or 12541 or 12545 or 12571
                  => new InfrastructureException("Serviço temporariamente indisponível. Tente novamente em instantes.", ex),
            _     => new InfrastructureException("Falha ao acessar o banco de dados.", ex)
        };
    }

    private static string MensagemUnicidade(OracleException ex)
    {
        var texto = ex.Message ?? string.Empty;

        if (texto.Contains("UK_VEICULO_PLACA", StringComparison.OrdinalIgnoreCase))
            return "Já existe um veículo cadastrado com esta placa.";

        return "Já existe um registro com os mesmos dados únicos.";
    }

    private static string MensagemCheck(OracleException ex)
    {
        var texto = ex.Message ?? string.Empty;

        if (texto.Contains("CK_VEICULO_SITUACAO", StringComparison.OrdinalIgnoreCase))
            return "Situação inválida. Valores aceitos: Disponível, Vendido ou Reservado.";

        if (texto.Contains("CK_VEICULO_PRECO", StringComparison.OrdinalIgnoreCase))
            return "Preço inválido: deve ser maior ou igual a zero.";

        if (texto.Contains("CK_VEICULO_QUILOMETRAGEM", StringComparison.OrdinalIgnoreCase))
            return "Quilometragem inválida: deve ser maior ou igual a zero.";

        if (texto.Contains("CK_VEICULO_ANO", StringComparison.OrdinalIgnoreCase))
            return "Ano inválido: deve ser 1900 ou posterior.";

        if (texto.Contains("CK_PROPRIETARIO_DATAS", StringComparison.OrdinalIgnoreCase))
            return "Datas inválidas: a data de venda não pode ser anterior à data de aquisição.";

        return "Valor inválido para um dos campos.";
    }
}
