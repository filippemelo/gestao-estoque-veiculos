using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Endpoints;
using GestaoVeiculos.Api.Repositories;
using GestaoVeiculos.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IConexaoFactory, ConexaoFactory>();

builder.Services.AddScoped<IVeiculoRepository, VeiculoRepository>();
builder.Services.AddScoped<IProprietarioRepository, ProprietarioRepository>();

builder.Services.AddScoped<IVeiculoService, VeiculoService>();
builder.Services.AddScoped<IProprietarioService, ProprietarioService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("", () => Results.Ok( new { dataHora = DateTime.UtcNow.ToShortTimeString(), 
        mensagem = "Operação realizada com sucesso!" })).WithName("Health Check");

app.AddVeiculoEnpoint();

app.Run();
