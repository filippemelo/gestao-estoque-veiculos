using System.ComponentModel.DataAnnotations;

namespace GestaoVeiculos.Api.Models.Filters;

public sealed record ListarVeiculosFilter(
    [StringLength(50)] string? Marca = null,
    [StringLength(30)] string? Situacao = null,
    [Range(1, int.MaxValue)] int Page = 1,
    [Range(1, 100)] int PageSize = 20);
