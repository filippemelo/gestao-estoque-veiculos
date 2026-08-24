using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Repositories;

public interface IProprietarioRepository
{
    Task<IEnumerable<Proprietario>> ListarProprietariosAsync();
    Task<Proprietario> ObterProprietarioAsync(int id);
    Task InserirProprietarioAsync(Proprietario proprietario);
    Task RemoverProprietarioAsync(int id);
}