using System.ComponentModel.DataAnnotations;
using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Models.Requests;

public sealed record CriarVeiculoRequest(
    [property: Required(ErrorMessage = "Marca é obrigatória.")]
    [property: StringLength(50, MinimumLength = 1, ErrorMessage = "Marca deve ter entre 1 e 50 caracteres.")]
    string Marca,

    [property: Required(ErrorMessage = "Modelo é obrigatório.")]
    [property: StringLength(100, MinimumLength = 1, ErrorMessage = "Modelo deve ter entre 1 e 100 caracteres.")]
    string Modelo,

    [property: Range(1900, 2100, ErrorMessage = "Ano deve estar entre 1900 e 2100.")]
    int Ano,

    [property: Required(ErrorMessage = "Cor é obrigatória.")]
    [property: StringLength(30, MinimumLength = 1, ErrorMessage = "Cor deve ter entre 1 e 30 caracteres.")]
    string Cor,

    [property: Range(typeof(decimal), "0", "99999999.99", ErrorMessage = "Preço deve ser maior ou igual a zero.")]
    decimal Preco,

    [property: Required(ErrorMessage = "Tipo é obrigatório.")]
    [property: StringLength(30, MinimumLength = 1, ErrorMessage = "Tipo deve ter entre 1 e 30 caracteres.")]
    string Tipo,

    [property: Required(ErrorMessage = "Placa é obrigatória.")]
    [property: RegularExpression(@"^[A-Z]{3}-?\d[A-Z0-9]\d{2}$", ErrorMessage = "Placa deve estar no formato ABC-1234 ou ABC1D23 (Mercosul).")]
    string Placa,

    [property: Range(0, int.MaxValue, ErrorMessage = "Quilometragem deve ser maior ou igual a zero.")]
    int Quilometragem)
{
    public const string SituacaoInicial = "Disponível";

    public static explicit operator Veiculo(CriarVeiculoRequest request)
    {
        return new Veiculo(
            request.Marca,
            request.Modelo,
            request.Ano,
            request.Cor,
            request.Preco,
            request.Tipo,
            SituacaoInicial,
            request.Placa,
            request.Quilometragem
        );
    }
}
