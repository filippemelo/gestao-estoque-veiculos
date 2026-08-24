using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Models.Requests;

public sealed record CriarVeiculoRequest(
    string Marca,
    string Modelo,
    int Ano,
    string Cor,
    decimal Preco,
    string Tipo,
    string Situacao,
    string Placa,
    int Quilometragem)
{
    public static explicit operator Veiculo(CriarVeiculoRequest request)
    {
        return new Veiculo(
            request.Marca,
            request.Modelo,
            request.Ano,
            request.Cor,
            request.Preco,
            request.Tipo,
            request.Situacao,
            request.Placa,
            request.Quilometragem
        );
    }
}
