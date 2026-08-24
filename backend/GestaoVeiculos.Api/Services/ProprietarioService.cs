using System.ComponentModel.DataAnnotations;
using GestaoVeiculos.Api.Domain.Entities;
using GestaoVeiculos.Api.Domain.Exceptions;
using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Models.Responses;
using GestaoVeiculos.Api.Repositories;
using ValidationException = GestaoVeiculos.Api.Domain.Exceptions.ValidationException;

namespace GestaoVeiculos.Api.Services;

public class ProprietarioService(
    IProprietarioRepository proprietarioRepository,
    IVeiculoRepository veiculoRepository) : IProprietarioService
{
    private readonly IProprietarioRepository _proprietarioRepository = proprietarioRepository;
    private readonly IVeiculoRepository _veiculoRepository = veiculoRepository;

    public async Task<ResultadoResponse<ProprietarioResponse>> CriarProprietarioAsync(CriarProprietarioRequest request)
    {
        Validar(request);

        var veiculo = await _veiculoRepository.ObterVeiculoAsync(request.VeiculoId);
        if (veiculo is null)
            throw new NotFoundException($"Veículo {request.VeiculoId} não encontrado.");

        if (await _proprietarioRepository.ExisteProprietarioAtualPorVeiculoAsync(request.VeiculoId))
            throw new ConflictException(
                $"O veículo {request.VeiculoId} já possui um proprietário atual. " +
                "Para trocar o proprietário ativo, edite o veículo e marque-o como Vendido informando o novo proprietário.");

        var dataAquisicao = DateTime.Today;

        var novo = new Proprietario(
            request.VeiculoId,
            request.NomeCompleto,
            request.Cpf,
            dataAquisicao,
            request.Observacao);

        var id = await _proprietarioRepository.InserirProprietarioAsync(novo);

        var criado = Proprietario.Reconstituir(
            id,
            request.VeiculoId,
            request.NomeCompleto,
            request.Cpf,
            dataAquisicao,
            null,
            request.Observacao);

        return new ResultadoResponse<ProprietarioResponse>((ProprietarioResponse)criado);
    }

    public async Task<ResultadoResponse<IEnumerable<ProprietarioResponse>>> ListarPorVeiculoAsync(int veiculoId)
    {
        var veiculo = await _veiculoRepository.ObterVeiculoAsync(veiculoId);
        if (veiculo is null)
            throw new NotFoundException($"Veículo {veiculoId} não encontrado.");

        var proprietarios = await _proprietarioRepository.ListarPorVeiculoAsync(veiculoId);

        var respostas = proprietarios.Select(p => (ProprietarioResponse)p).ToList();

        return new ResultadoResponse<IEnumerable<ProprietarioResponse>>(respostas);
    }

    private static void Validar(object request)
    {
        var contexto = new ValidationContext(request);
        var resultados = new List<ValidationResult>();

        if (Validator.TryValidateObject(request, contexto, resultados, validateAllProperties: true))
            return;

        var mensagens = string.Join(" ", resultados.Select(r => r.ErrorMessage));
        throw new ValidationException(mensagens);
    }
}
