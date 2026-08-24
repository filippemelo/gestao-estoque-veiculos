using GestaoVeiculos.Api.Domain.Entities;
using GestaoVeiculos.Api.Models.PageOptions;

namespace GestaoVeiculos.Api.Repositories;

public interface IVeiculoRepository
{
    Task<(IReadOnlyList<Veiculo> Itens, int Total)> ListarVeiculosAsync(ListarVeiculosPageOption pageOption);
    Task<Veiculo?> ObterVeiculoAsync(int id);
    Task<Veiculo?> ObterVeiculoPorPlacaAsync(string placa);
    Task<int> InserirVeiculoAsync(Veiculo veiculo);
    Task AtualizarVeiculoAsync(Veiculo veiculo);
    Task RemoverVeiculoAsync(int id);
}