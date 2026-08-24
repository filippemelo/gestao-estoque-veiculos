using GestaoVeiculos.Api.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestaoVeiculos.Api.Infrastructure.ExceptionHandling;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (status, title) = Mapear(exception);

        if (status >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Erro não tratado: {Mensagem}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Falha de domínio: {Mensagem}", exception.Message);
        }

        var problema = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = status >= StatusCodes.Status500InternalServerError
                ? "Ocorreu um erro inesperado. Tente novamente mais tarde."
                : exception.Message,
            Type = $"https://httpstatuses.io/{status}",
            Instance = httpContext.Request.Path
        };

        problema.Extensions["traceId"] = httpContext.TraceIdentifier;

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problema, cancellationToken);

        return true;
    }

    private static (int Status, string Title) Mapear(Exception exception) => exception switch
    {
        NotFoundException => (StatusCodes.Status404NotFound, "Recurso não encontrado"),
        ValidationException => (StatusCodes.Status400BadRequest, "Requisição inválida"),
        ConflictException => (StatusCodes.Status409Conflict, "Conflito de estado"),
        _ => (StatusCodes.Status500InternalServerError, "Erro interno do servidor")
    };
}
