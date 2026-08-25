namespace GestaoVeiculos.Api.Models.Responses;

public sealed class ResultadoPaginadoResponse<T>
{
    public bool Sucesso { get; init; }
    public IReadOnlyCollection<T> Dados { get; init; } = [];
    public PaginacaoResponse Paginacao { get; init; } = new();
    public string? Mensagem { get; init; }

    public static ResultadoPaginadoResponse<T> Criar(
        IEnumerable<T> dados,
        int pagina,
        int tamanhoPagina,
        int totalRegistros,
        string? mensagem = null)
    {
        var lista = dados as IReadOnlyCollection<T> ?? dados.ToList();

        return new ResultadoPaginadoResponse<T>
        {
            Sucesso = true,
            Dados = lista,
            Paginacao = PaginacaoResponse.Criar(pagina, tamanhoPagina, totalRegistros),
            Mensagem = mensagem
        };
    }
}

public sealed class PaginacaoResponse
{
    public int Pagina { get; init; }
    public int TamanhoPagina { get; init; }
    public int TotalRegistros { get; init; }
    public int TotalPaginas { get; init; }
    public bool TemPaginaAnterior { get; init; }
    public bool TemProximaPagina { get; init; }

    public static PaginacaoResponse Criar(int pagina, int tamanhoPagina, int totalRegistros)
    {
        var totalPaginas = tamanhoPagina == 0
            ? 0
            : (int)Math.Ceiling(totalRegistros / (double)tamanhoPagina);

        return new PaginacaoResponse
        {
            Pagina = pagina,
            TamanhoPagina = tamanhoPagina,
            TotalRegistros = totalRegistros,
            TotalPaginas = totalPaginas,
            TemPaginaAnterior = pagina > 1,
            TemProximaPagina = pagina < totalPaginas
        };
    }
}
