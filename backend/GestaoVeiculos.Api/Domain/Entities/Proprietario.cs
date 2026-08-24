namespace GestaoVeiculos.Api.Domain.Entities;

public class Proprietario
{

    public Proprietario(int veiculoId, string nomeCompleto, string cpf, 
        DateTime dataAquisicao, string? observacao)
    {
        VeiculoId = veiculoId;
        NomeCompleto = nomeCompleto;
        Cpf = cpf;
        DataAquisicao = dataAquisicao;
        Observacao = observacao;
    }
    
    public int Id { get; private set; }
    public int VeiculoId { get; private set; }
    public string NomeCompleto { get; private set; }
    public string Cpf { get; private set; } 
    public DateTime DataAquisicao { get; private set; }
    public DateTime? DataVenda { get; private set; }
    public string? Observacao { get; private set; }
    
    public bool IsProprietarioAtual => DataVenda is null;
}