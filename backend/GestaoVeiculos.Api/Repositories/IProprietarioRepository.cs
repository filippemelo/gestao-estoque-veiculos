using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Repositories;

public interface IProprietarioRepository
{
    Task<IEnumerable<Proprietario>> ListarProprietariosAsync();
    Task<IEnumerable<Proprietario>> ListarPorVeiculoAsync(int veiculoId);
    Task<bool> ExisteProprietarioVeiculoAsync(int veiculoId);
    Task<bool> ExisteProprietarioAtualPorVeiculoAsync(int veiculoId);
    Task<Proprietario> ObterProprietarioAsync(int id);
    Task<int> InserirProprietarioAsync(Proprietario proprietario);
    Task RemoverProprietarioAsync(int id);
}