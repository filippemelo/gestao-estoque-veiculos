using System.ComponentModel.DataAnnotations;

namespace GestaoVeiculos.Api.Models.Requests;

public sealed record AtualizarVeiculoRequest(
    [Required(ErrorMessage = "Marca é obrigatória.")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Marca deve ter entre 1 e 50 caracteres.")]
    string Marca,

    [Required(ErrorMessage = "Modelo é obrigatório.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Modelo deve ter entre 1 e 100 caracteres.")]
    string Modelo,

    [Range(1900, 2100, ErrorMessage = "Ano deve estar entre 1900 e 2100.")]
    int Ano,

    [Required(ErrorMessage = "Cor é obrigatória.")]
    [StringLength(30, MinimumLength = 1, ErrorMessage = "Cor deve ter entre 1 e 30 caracteres.")]
    string Cor,

    [Range(typeof(decimal), "0", "99999999.99",
        ConvertValueInInvariantCulture = true,
        ParseLimitsInInvariantCulture = true,
        ErrorMessage = "Preço deve ser maior ou igual a zero.")]
    decimal Preco,

    [Required(ErrorMessage = "Tipo é obrigatório.")]
    [StringLength(30, MinimumLength = 1, ErrorMessage = "Tipo deve ter entre 1 e 30 caracteres.")]
    string Tipo,

    [Required(ErrorMessage = "Situação é obrigatória.")]
    [RegularExpression("^(Disponível|Reservado|Vendido)$",
        ErrorMessage = "Situação deve ser Disponível, Reservado ou Vendido.")]
    string Situacao,

    [Range(0, int.MaxValue, ErrorMessage = "Quilometragem deve ser maior ou igual a zero.")]
    int Quilometragem,

    NovoProprietarioRequest? NovoProprietario = null);
