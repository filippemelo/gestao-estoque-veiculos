namespace GestaoVeiculos.Api.Models.Responses;

public sealed record PaginacaoResponse<T>(
    IReadOnlyList<T> Itens,
    int Page,
    int PageSize,
    int Total);
