namespace GestaoVeiculos.Api.Models.Responses;

public sealed record ResultadoPaginadoResponse<T>(
    IEnumerable<T> Dados,
    int Pagina,
    int Tamanho,
    int Total)
{
    public int TotalPaginas => Tamanho == 0 ? 0 : (int)Math.Ceiling(Total / (double)Tamanho);
}
