using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Models.Responses;

public sealed record ProprietarioResponse(
    int Id,
    string NomeCompleto,
    string Cpf,
    DateTime DataAquisicao,
    DateTime? DataVenda,
    string? Observacao,
    bool IsProprietarioAtual)
{
    public static explicit operator ProprietarioResponse(Proprietario proprietario)
    {
        return new ProprietarioResponse(
            proprietario.Id,
            proprietario.NomeCompleto,
            proprietario.Cpf,
            proprietario.DataAquisicao,
            proprietario.DataVenda,
            proprietario.Observacao,
            proprietario.IsProprietarioAtual);
    }
}
