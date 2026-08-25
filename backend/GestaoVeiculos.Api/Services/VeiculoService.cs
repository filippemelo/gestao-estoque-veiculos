using System.ComponentModel.DataAnnotations;
using GestaoVeiculos.Api.Domain.Entities;
using GestaoVeiculos.Api.Domain.Exceptions;
using GestaoVeiculos.Api.Models.PageOptions;
using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Models.Responses;
using GestaoVeiculos.Api.Repositories;
using ValidationException = GestaoVeiculos.Api.Domain.Exceptions.ValidationException;

namespace GestaoVeiculos.Api.Services;

public class VeiculoService(
    IVeiculoRepository veiculoRepository,
    IProprietarioRepository proprietarioRepository) : IVeiculoService
{
    private readonly IVeiculoRepository _veiculoRepository = veiculoRepository;
    private readonly IProprietarioRepository _proprietarioRepository = proprietarioRepository;

    public async Task<ResultadoResponse<VeiculoResponse>> CriarVeiculoAsync(CriarVeiculoRequest request)
    {
        Validar(request);

        var jaExiste = await _veiculoRepository.ObterVeiculoPorPlacaAsync(request.Placa);
        if (jaExiste is not null)
            throw new ConflictException($"Já existe um veículo cadastrado com a placa {request.Placa}.");

        var veiculo = (Veiculo)request;

        var id = await _veiculoRepository.InserirVeiculoAsync(veiculo);

        var criado = Veiculo.Reconstituir(
            id,
            veiculo.Marca,
            veiculo.Modelo,
            veiculo.Ano,
            veiculo.Cor,
            veiculo.Preco,
            veiculo.Tipo,
            veiculo.Situacao,
            veiculo.Placa,
            veiculo.Quilometragem);

        return ResultadoResponse<VeiculoResponse>.Ok((VeiculoResponse)criado);
    }

    public async Task<ResultadoResponse<VeiculoDetalheResponse>> ObterVeiculoAsync(int id)
    {
        var veiculo = await _veiculoRepository.ObterVeiculoAsync(id);

        if (veiculo is null)
            throw new NotFoundException($"Veículo {id} não encontrado.");

        var proprietarios = await _proprietarioRepository.ListarPorVeiculoAsync(id);

        var detalhe = VeiculoDetalheResponse.De(veiculo, proprietarios);

        return ResultadoResponse<VeiculoDetalheResponse>.Ok(detalhe);
    }

    public async Task<ResultadoPaginadoResponse<VeiculoResponse>> ListarVeiculosAsync(ListarVeiculosPageOption pageOption)
    {
        Validar(pageOption);

        var (itens, total) = await _veiculoRepository.ListarVeiculosAsync(pageOption);

        var respostas = itens.Select(v => (VeiculoResponse)v).ToList();

        return ResultadoPaginadoResponse<VeiculoResponse>.Criar(respostas, pageOption.Page, pageOption.PageSize, total);
    }

    public async Task ExcluirVeiculoAsync(int id)
    {
        var veiculo = await _veiculoRepository.ObterVeiculoAsync(id);

        if (veiculo is null)
            throw new NotFoundException($"Veículo {id} não encontrado.");

        if (await _proprietarioRepository.ExisteProprietarioVeiculoAsync(id))
            throw new ConflictException(
                $"Não é possível excluir o veículo {id}: existem proprietários cadastrados.");

        await _veiculoRepository.RemoverVeiculoAsync(id);
    }

    public async Task<ResultadoResponse<VeiculoResponse>> AtualizarVeiculoAsync(int id, AtualizarVeiculoRequest request)
    {
        Validar(request);
        if (request.NovoProprietario is not null)
            Validar(request.NovoProprietario);

        var atual = await _veiculoRepository.ObterVeiculoAsync(id);
        if (atual is null)
            throw new NotFoundException($"Veículo {id} não encontrado.");

        if (request.Situacao == "Vendido" && request.NovoProprietario is null)
            throw new ValidationException(
                "Ao marcar o veículo como Vendido é obrigatório informar o novo proprietário.");

        var atualizado = Veiculo.Reconstituir(
            atual.Id,
            request.Marca,
            request.Modelo,
            request.Ano,
            request.Cor,
            request.Preco,
            request.Tipo,
            request.Situacao,
            atual.Placa,
            request.Quilometragem);

        if (request.Situacao == "Vendido")
        {
            var hoje = DateTime.Today;

            var proprietarios = await _proprietarioRepository.ListarPorVeiculoAsync(id);
            var atualAnterior = proprietarios.FirstOrDefault(p => p.IsProprietarioAtual);

            var novo = new Proprietario(
                id,
                request.NovoProprietario!.NomeCompleto,
                request.NovoProprietario.Cpf,
                hoje,
                request.NovoProprietario.Observacao);

            await _veiculoRepository.AtualizarComVendaAsync(atualizado, atualAnterior?.Id, hoje, novo);
        }
        else
        {
            await _veiculoRepository.AtualizarVeiculoAsync(atualizado);
        }

        return ResultadoResponse<VeiculoResponse>.Ok((VeiculoResponse)atualizado);
    }

    private static void Validar(object request)
    {
        var contexto = new ValidationContext(request);
        var resultados = new List<ValidationResult>();

        if (Validator.TryValidateObject(request, contexto, resultados, validateAllProperties: true))
            return;

        var erros = resultados
            .Select(r => new ErroCampo(r.MemberNames.FirstOrDefault(), r.ErrorMessage ?? string.Empty))
            .ToArray();

        throw new ValidationException("Existem dados inválidos.", erros);
    }
}
