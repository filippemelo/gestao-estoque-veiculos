using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Repositories;

public interface IVeiculoRepository
{
    Task<IEnumerable<Veiculo>> ListarVeiculosAsync();
    Task<Veiculo?> ObterVeiculoAsync(int id);
    Task<Veiculo?> ObterVeiculoPorPlacaAsync(string placa);
    Task<int> InserirVeiculoAsync(Veiculo veiculo);
    Task AtualizarVeiculoAsync(Veiculo veiculo);
    Task RemoverVeiculoAsync(int id);
}