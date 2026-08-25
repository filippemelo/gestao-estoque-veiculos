using GestaoVeiculos.Api.Models.PageOptions;
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
            var resposta = await service.CriarVeiculoAsync(request);
            return Results.Created($"/veiculos/{resposta.Dados!.Id}", resposta);
        });

        group.MapGet("", async ([AsParameters] ListarVeiculosPageOption pageOption, IVeiculoService service) =>
        {
            var resultado = await service.ListarVeiculosAsync(pageOption);
            return Results.Ok(resultado);
        });

        group.MapGet("{id:int}", async (int id, IVeiculoService service) =>
        {
            var veiculo = await service.ObterVeiculoAsync(id);
            return Results.Ok(veiculo);
        });

        group.MapDelete("{id:int}", async (int id, IVeiculoService service) =>
        {
            await service.ExcluirVeiculoAsync(id);
            return Results.NoContent();
        });

        group.MapPut("{id:int}", async (int id, AtualizarVeiculoRequest request, IVeiculoService service) =>
        {
            var resposta = await service.AtualizarVeiculoAsync(id, request);
            return Results.Ok(resposta);
        });
    }
}