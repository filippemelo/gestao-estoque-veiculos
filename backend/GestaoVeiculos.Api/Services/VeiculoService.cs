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

        return new ResultadoResponse<VeiculoResponse>((VeiculoResponse)criado);
    }

    public async Task<ResultadoResponse<VeiculoDetalheResponse>> ObterVeiculoAsync(int id)
    {
        var veiculo = await _veiculoRepository.ObterVeiculoAsync(id);

        if (veiculo is null)
            throw new NotFoundException($"Veículo {id} não encontrado.");

        var proprietarios = await _proprietarioRepository.ListarPorVeiculoAsync(id);

        var detalhe = VeiculoDetalheResponse.De(veiculo, proprietarios);

        return new ResultadoResponse<VeiculoDetalheResponse>(detalhe);
    }

    public async Task<ResultadoPaginadoResponse<VeiculoResponse>> ListarVeiculosAsync(ListarVeiculosPageOption pageOption)
    {
        Validar(pageOption);

        var (itens, total) = await _veiculoRepository.ListarVeiculosAsync(pageOption);

        var respostas = itens.Select(v => (VeiculoResponse)v).ToList();

        return new ResultadoPaginadoResponse<VeiculoResponse>(respostas, pageOption.Page, pageOption.PageSize, total);
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
