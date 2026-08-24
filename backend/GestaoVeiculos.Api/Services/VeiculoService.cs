using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Models.Responses;
using GestaoVeiculos.Api.Repositories;

namespace GestaoVeiculos.Api.Services;

public class VeiculoService(IVeiculoRepository veiculoRepository) : IVeiculoService
{
    private readonly IVeiculoRepository _veiculoRepository = veiculoRepository;
    
    public async Task<VeiculoResponse> CriarAsync(CriarVeiculoRequest request)
    {
        throw new NotImplementedException();
    }
}