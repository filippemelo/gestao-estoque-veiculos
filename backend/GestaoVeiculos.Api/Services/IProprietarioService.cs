using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Models.Responses;

namespace GestaoVeiculos.Api.Services;

public interface IProprietarioService
{
    Task<ResultadoResponse<ProprietarioResponse>> CriarProprietarioAsync(CriarProprietarioRequest request);
    Task<ResultadoResponse<IEnumerable<ProprietarioResponse>>> ListarPorVeiculoAsync(int veiculoId);
    Task<ResultadoResponse<ProprietarioResponse>> AtualizarProprietarioAsync(int id, AtualizarProprietarioRequest request);
    Task ExcluirProprietarioAsync(int id);
}
