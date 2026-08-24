using GestaoVeiculos.Api.Data;
using GestaoVeiculos.Api.Endpoints;
using GestaoVeiculos.Api.Infrastructure.ExceptionHandling;
using GestaoVeiculos.Api.Repositories;
using GestaoVeiculos.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string corsPolicy = "Frontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<IConexaoFactory, ConexaoFactory>();

builder.Services.AddScoped<IVeiculoRepository, VeiculoRepository>();
builder.Services.AddScoped<IProprietarioRepository, ProprietarioRepository>();

builder.Services.AddScoped<IVeiculoService, VeiculoService>();
builder.Services.AddScoped<IProprietarioService, ProprietarioService>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(corsPolicy);

app.MapGet("", () => Results.Ok( new { dataHora = DateTime.UtcNow.ToShortTimeString(),
        mensagem = "Operação realizada com sucesso!" })).WithName("Health Check");

app.AddVeiculoEnpoint();
app.AddProprietarioEndpoint();

app.Run();
