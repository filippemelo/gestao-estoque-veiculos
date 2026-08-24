using System.ComponentModel.DataAnnotations;

namespace GestaoVeiculos.Api.Models.Requests;

public sealed record CriarProprietarioRequest(
    [Range(1, int.MaxValue, ErrorMessage = "VeiculoId deve ser maior que zero.")]
    int VeiculoId,

    [Required(ErrorMessage = "Nome completo é obrigatório.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Nome completo deve ter entre 1 e 100 caracteres.")]
    string NomeCompleto,

    [Required(ErrorMessage = "CPF é obrigatório.")]
    [StringLength(14, MinimumLength = 11, ErrorMessage = "CPF deve ter entre 11 e 14 caracteres.")]
    string Cpf,

    [StringLength(255, ErrorMessage = "Observação deve ter no máximo 255 caracteres.")]
    string? Observacao = null);
