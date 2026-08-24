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
    int Quilometragem,
    IEnumerable<ProprietarioResponse> Proprietarios)
{
    public static VeiculoDetalheResponse De(Veiculo veiculo, IEnumerable<Proprietario> proprietarios)
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
            veiculo.Quilometragem,
            proprietarios.Select(p => (ProprietarioResponse)p));
    }
}
