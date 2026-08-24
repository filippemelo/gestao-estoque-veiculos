namespace GestaoVeiculos.Api.Domain.Exceptions;

public sealed class ConflictException : DomainException
{
    public ConflictException(string message) : base(message)
    {
    }
}
