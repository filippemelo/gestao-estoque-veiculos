namespace GestaoVeiculos.Api.Domain.Exceptions;

public sealed class ValidationException : DomainException
{
    public IReadOnlyCollection<ErroCampo> Erros { get; }

    public ValidationException(string message) : base(message)
    {
        Erros = [];
    }

    public ValidationException(string message, IReadOnlyCollection<ErroCampo> erros) : base(message)
    {
        Erros = erros;
    }
}

public sealed record ErroCampo(string? Campo, string Mensagem);
