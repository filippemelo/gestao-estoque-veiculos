using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Models.Responses;

namespace GestaoVeiculos.Api.Services;

public interface IVeiculoService
{
    Task<VeiculoResponse> CriarVeiculoAsync(CriarVeiculoRequest request);
}