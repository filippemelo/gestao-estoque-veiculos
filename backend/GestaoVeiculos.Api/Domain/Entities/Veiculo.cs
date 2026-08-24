namespace GestaoVeiculos.Api.Domain.Entities;

public sealed class Veiculo
{
    public Veiculo(string marca, string modelo, int ano, string cor, decimal preco, 
        string tipo, string situacao, string placa, int quilometragem)
    {
        Marca = marca;
        Modelo = modelo;
        Ano = ano;
        Cor = cor;
        Preco = preco;
        Tipo = tipo;
        Situacao = situacao;
        Placa = placa;
        Quilometragem = quilometragem;
    }
    
    public int Id { get; private set; }
    public string Marca { get; private set; }
    public string Modelo { get; private set; } 
    public int Ano { get; private set; }
    public string Cor { get; private set; } 
    public decimal Preco { get; private set; }
    public string Tipo { get; private set; } 
    public string Situacao { get; private set; } 
    public string Placa { get; private set; } 
    public int Quilometragem { get; private set; }
    
    public List<Proprietario> Proprietarios { get; set; } = [];
}