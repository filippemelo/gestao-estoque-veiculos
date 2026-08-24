using GestaoVeiculos.Api.Models.PageOptions;
using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Models.Responses;

namespace GestaoVeiculos.Api.Services;

public interface IVeiculoService
{
    Task<ResultadoResponse<VeiculoResponse>> CriarVeiculoAsync(CriarVeiculoRequest request);
    Task<ResultadoResponse<VeiculoDetalheResponse>> ObterVeiculoAsync(int id);
    Task<ResultadoPaginadoResponse<VeiculoResponse>> ListarVeiculosAsync(ListarVeiculosPageOption pageOption);
    Task ExcluirVeiculoAsync(int id);
    Task<ResultadoResponse<VeiculoResponse>> AtualizarVeiculoAsync(int id, AtualizarVeiculoRequest request);
}