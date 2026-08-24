using GestaoVeiculos.Api.Domain.Entities;

namespace GestaoVeiculos.Api.Repositories;

public class ProprietarioRepository : IProprietarioRepository
{
    public Task<IEnumerable<Proprietario>> ListarProprietariosAsync()
    {
        throw new NotImplementedException();
    }

    public Task<Proprietario> ObterProprietarioAsync(int id)
    {
        throw new NotImplementedException();
    }

    public Task InserirProprietarioAsync(Proprietario proprietario)
    {
        throw new NotImplementedException();
    }

    public Task RemoverProprietarioAsync(int id)
    {
        throw new NotImplementedException();
    }
}