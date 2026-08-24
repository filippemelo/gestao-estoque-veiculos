using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Models.Responses;

public sealed record VeiculoDetalheResponse(
    int Id,
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
    public static explicit operator VeiculoDetalheResponse(Veiculo veiculo)
    {
        return new VeiculoDetalheResponse(
            veiculo.Id,
            veiculo.Marca,
            veiculo.Modelo,
            veiculo.Ano,
            veiculo.Cor,
            veiculo.Preco,
            veiculo.Tipo,
            veiculo.Situacao,
            veiculo.Placa,
            veiculo.Quilometragem
        );
    }
}