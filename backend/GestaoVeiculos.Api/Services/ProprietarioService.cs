using System.ComponentModel.DataAnnotations;
using GestaoVeiculos.Api.Domain.Entities;
using GestaoVeiculos.Api.Domain.Exceptions;
using GestaoVeiculos.Api.Models.PageOptions;
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

    public async Task<ResultadoPaginadoResponse<ProprietarioResponse>> ListarProprietariosAsync(ListarProprietariosPageOption pageOption)
    {
        Validar(pageOption);

        var (itens, total) = await _proprietarioRepository.ListarProprietariosAsync(pageOption);

        var respostas = itens.Select(p => (ProprietarioResponse)p).ToList();

        return new ResultadoPaginadoResponse<ProprietarioResponse>(respostas, pageOption.Page, pageOption.PageSize, total);
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

    public async Task<ResultadoResponse<ProprietarioResponse>> AtualizarProprietarioAsync(int id, AtualizarProprietarioRequest request)
    {
        Validar(request);

        var atual = await _proprietarioRepository.ObterProprietarioAsync(id);
        if (atual is null)
            throw new NotFoundException($"Proprietário {id} não encontrado.");

        if (atual.DataVenda is not null && request.DataVenda is null)
            throw new ValidationException("Não é permitido remover a DataVenda de um proprietário já encerrado.");

        if (request.DataVenda is { } dv && dv < atual.DataAquisicao)
            throw new ValidationException("DataVenda não pode ser anterior à DataAquisicao.");

        var atualizado = Proprietario.Reconstituir(
            atual.Id,
            atual.VeiculoId,
            request.NomeCompleto,
            request.Cpf,
            atual.DataAquisicao,
            request.DataVenda,
            request.Observacao);

        var encerrandoAtual = atual.DataVenda is null && request.DataVenda is not null;

        if (encerrandoAtual)
        {
            var veiculo = await _veiculoRepository.ObterVeiculoAsync(atual.VeiculoId);
            if (veiculo is null)
                throw new NotFoundException($"Veículo {atual.VeiculoId} não encontrado.");

            var veiculoVendido = Veiculo.Reconstituir(
                veiculo.Id,
                veiculo.Marca,
                veiculo.Modelo,
                veiculo.Ano,
                veiculo.Cor,
                veiculo.Preco,
                veiculo.Tipo,
                "Vendido",
                veiculo.Placa,
                veiculo.Quilometragem);

            await _proprietarioRepository.AtualizarEEncerrarAtualAsync(atualizado, veiculoVendido);
        }
        else
        {
            await _proprietarioRepository.AtualizarProprietarioAsync(atualizado);
        }

        return new ResultadoResponse<ProprietarioResponse>((ProprietarioResponse)atualizado);
    }

    public async Task ExcluirProprietarioAsync(int id)
    {
        var proprietario = await _proprietarioRepository.ObterProprietarioAsync(id);
        if (proprietario is null)
            throw new NotFoundException($"Proprietário {id} não encontrado.");

        if (proprietario.IsProprietarioAtual)
            throw new ConflictException(
                $"Não é possível excluir o proprietário {id}: ainda é o proprietário atual do veículo.");

        await _proprietarioRepository.RemoverProprietarioAsync(id);
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
