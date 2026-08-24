using System.ComponentModel.DataAnnotations;

namespace GestaoVeiculos.Api.Models.PageOptions;

public sealed record ListarProprietariosPageOption(
    [Range(1, int.MaxValue)] int Page = 1,
    [Range(1, 100)] int PageSize = 20);
