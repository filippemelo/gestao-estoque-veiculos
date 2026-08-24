namespace GestaoVeiculos.Api.Domain.Exceptions;

public sealed class InfrastructureException : DomainException
{
    public InfrastructureException(string message, Exception inner) : base(message)
    {
        InnerCause = inner;
    }

    public Exception InnerCause { get; }
}
