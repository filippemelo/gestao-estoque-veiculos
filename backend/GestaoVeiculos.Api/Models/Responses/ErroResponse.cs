namespace GestaoVeiculos.Api.Models.Responses;

public sealed class ErroResponse
{
    public bool Sucesso { get; init; } = false;
    public string Codigo { get; init; } = "ERRO_INTERNO";
    public string Mensagem { get; init; } = "Ocorreu um erro inesperado.";
    public IReadOnlyCollection<ErroDetalheResponse>? Erros { get; init; }
    public string? TraceId { get; init; }
}

public sealed class ErroDetalheResponse
{
    public string? Campo { get; init; }
    public string Mensagem { get; init; } = string.Empty;
}
