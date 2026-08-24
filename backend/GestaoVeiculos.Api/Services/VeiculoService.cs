using System.ComponentModel.DataAnnotations;
using GestaoVeiculos.Api.Domain.Entities;
using GestaoVeiculos.Api.Domain.Exceptions;
using GestaoVeiculos.Api.Models.Requests;
using GestaoVeiculos.Api.Models.Responses;
using GestaoVeiculos.Api.Repositories;
using ValidationException = GestaoVeiculos.Api.Domain.Exceptions.ValidationException;

namespace GestaoVeiculos.Api.Services;

public class VeiculoService(IVeiculoRepository veiculoRepository) : IVeiculoService
{
    private readonly IVeiculoRepository _veiculoRepository = veiculoRepository;

    public async Task<VeiculoResponse> CriarVeiculoAsync(CriarVeiculoRequest request)
    {
        ValidarCampos(request);

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

        return (VeiculoResponse)criado;
    }

    private static void ValidarCampos(CriarVeiculoRequest request)
    {
        var contexto = new ValidationContext(request);
        var resultados = new List<ValidationResult>();

        if (Validator.TryValidateObject(request, contexto, resultados, validateAllProperties: true))
            return;

        var mensagens = string.Join(" ", resultados.Select(r => r.ErrorMessage));
        throw new ValidationException(mensagens);
    }
}
