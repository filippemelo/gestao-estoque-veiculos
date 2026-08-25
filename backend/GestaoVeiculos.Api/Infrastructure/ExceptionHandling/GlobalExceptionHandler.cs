using GestaoVeiculos.Api.Domain.Exceptions;
using GestaoVeiculos.Api.Models.Responses;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;

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
        var (status, codigo, mensagem) = Mapear(exception, httpContext);

        if (exception is InfrastructureException infra)
        {
            _logger.LogError(infra.InnerCause, "Falha de infraestrutura: {Mensagem}", infra.Message);
        }
        else if (status >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Erro não tratado: {Mensagem}", exception.Message);
        }
        else
        {
            _logger.LogWarning("Falha de domínio: {Mensagem}", exception.Message);
        }

        var erros = exception is ValidationException ve && ve.Erros.Count > 0
            ? ve.Erros
                .Select(e => new ErroDetalheResponse { Campo = e.Campo, Mensagem = e.Mensagem })
                .ToArray()
            : null;

        var resposta = new ErroResponse
        {
            Codigo = codigo,
            Mensagem = mensagem,
            Erros = erros,
            TraceId = httpContext.TraceIdentifier
        };

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(resposta, cancellationToken);

        return true;
    }

    private static (int Status, string Codigo, string Mensagem) Mapear(
        Exception exception,
        HttpContext _) => exception switch
    {
        NotFoundException => (StatusCodes.Status404NotFound, "NAO_ENCONTRADO", exception.Message),
        ValidationException => (StatusCodes.Status400BadRequest, "VALIDACAO", exception.Message),
        ConflictException => (StatusCodes.Status409Conflict, "REGRA_NEGOCIO", exception.Message),
        InfrastructureException => (StatusCodes.Status503ServiceUnavailable, "SERVICO_INDISPONIVEL", exception.Message),
        _ => (StatusCodes.Status500InternalServerError, "ERRO_INTERNO", "Ocorreu um erro inesperado. Tente novamente mais tarde.")
    };
}
