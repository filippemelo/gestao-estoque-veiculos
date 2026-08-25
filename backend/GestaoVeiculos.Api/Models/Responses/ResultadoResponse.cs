namespace GestaoVeiculos.Api.Models.Responses;

public sealed class ResultadoResponse<T>
{
    public bool Sucesso { get; init; }
    public T? Dados { get; init; }
    public string? Mensagem { get; init; }

    public static ResultadoResponse<T> Ok(T dados, string? mensagem = null) => new()
    {
        Sucesso = true,
        Dados = dados,
        Mensagem = mensagem
    };

    public static ResultadoResponse<T> Falha(string mensagem) => new()
    {
        Sucesso = false,
        Mensagem = mensagem
    };
}
