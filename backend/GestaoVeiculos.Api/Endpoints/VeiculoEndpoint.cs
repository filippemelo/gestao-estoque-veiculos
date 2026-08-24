namespace GestaoVeiculos.Api.Endpoints;

public static class VeiculoEndpoint
{
    public static void AddVeiculoEnpoint(this WebApplication app)
    {
        var group = app.MapGroup("veiculos");

        group.MapGet("{id:int}", async (int id) =>
        {
            return Results.Ok();
        });
    }
}