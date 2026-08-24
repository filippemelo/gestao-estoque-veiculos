using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Endpoints;
using GestaoVeiculos.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IConexaoFactory, ConexaoFactory>();

builder.Services.AddScoped<IVeiculoRepository, VeiculoRepository>();
builder.Services.AddScoped<IProprietarioRepository, ProprietarioRepository>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("", () => Results.Ok( new { data = DateTime.UtcNow, mensagem = "Operação realizada com sucesso!" }))
.WithName("Health Check");

app.AddVeiculoEnpoint();

app.Run();
