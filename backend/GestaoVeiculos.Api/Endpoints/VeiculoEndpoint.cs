using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Services;

namespace GestaoVeiculos.Api.Endpoints;

public static class VeiculoEndpoint
{
    public static void AddVeiculoEnpoint(this WebApplication app)
    {
        var group = app.MapGroup("veiculos");

        group.MapPost("", async (CriarVeiculoRequest request, IVeiculoService service) =>
        {
            var veiculo = await service.CriarVeiculoAsync(request);
            return Results.Created($"/veiculos/{veiculo.Id}", veiculo);
        });
        
        group.MapGet("{id:int}", async (int id) =>
        {
            return Results.Ok();
        });
    }
}