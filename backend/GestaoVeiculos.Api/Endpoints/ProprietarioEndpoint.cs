using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Services;

namespace GestaoVeiculos.Api.Endpoints;

public static class ProprietarioEndpoint
{
    public static void AddProprietarioEndpoint(this WebApplication app)
    {
        var group = app.MapGroup("proprietarios");

        group.MapPost("", async (CriarProprietarioRequest request, IProprietarioService service) =>
        {
            var resposta = await service.CriarProprietarioAsync(request);
            return Results.Created($"/proprietarios/{resposta.Dados.Id}", resposta);
        });

        group.MapGet("veiculo/{veiculoId:int}", async (int veiculoId, IProprietarioService service) =>
        {
            var resposta = await service.ListarPorVeiculoAsync(veiculoId);
            return Results.Ok(resposta);
        });
    }
}
