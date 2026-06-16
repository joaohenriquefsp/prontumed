using PatientService.Domain.Eventos;
using PatientService.Domain.Excecoes;
using PatientService.Domain.Servicos;

namespace PatientService.Domain.Entidades;

public class Paciente : AggregateRoot
{
    public Guid Id { get; private set; }
    public Guid? IdUsuario { get; private set; }
    public string PrimeiroNome { get; private set; } = string.Empty;
    public string Sobrenome { get; private set; } = string.Empty;
    public string Cpf { get; private set; } = string.Empty;
    public DateOnly DataNascimento { get; private set; }
    public string? Sexo { get; private set; }
    public string? Telefone { get; private set; }
    public string? Email { get; private set; }
    public string? EnderecoLogradouro { get; private set; }
    public string? EnderecoCidade { get; private set; }
    public string? EnderecoUf { get; private set; }
    public string? EnderecoCep { get; private set; }
    public bool Ativo { get; private set; }
    public DateTime CriadoEm { get; private set; }
    public DateTime AtualizadoEm { get; private set; }

    private Paciente() { }

    public static Paciente Criar(
        string primeiroNome,
        string sobrenome,
        string cpf,
        DateOnly dataNascimento,
        string? sexo,
        string? telefone,
        string? email,
        string? logradouro,
        string? cidade,
        string? uf,
        string? cep,
        Guid? idUsuario = null)
    {
        var cpfDigitos = ValidadorCpf.ApenasDigitos(cpf);

        if (!ValidadorCpf.Valido(cpfDigitos))
            throw new CpfInvalidoException(cpf);

        var paciente = new Paciente
        {
            Id = Guid.NewGuid(),
            IdUsuario = idUsuario,
            PrimeiroNome = primeiroNome,
            Sobrenome = sobrenome,
            Cpf = cpfDigitos,
            DataNascimento = dataNascimento,
            Sexo = sexo,
            Telefone = telefone,
            Email = email,
            EnderecoLogradouro = logradouro,
            EnderecoCidade = cidade,
            EnderecoUf = uf,
            EnderecoCep = cep,
            Ativo = true,
            CriadoEm = DateTime.UtcNow,
            AtualizadoEm = DateTime.UtcNow
        };

        paciente.AdicionarEvento(new PacienteCadastradoEvent(
            paciente.Id, primeiroNome, sobrenome, cpfDigitos, dataNascimento));

        return paciente;
    }

    public void Atualizar(
        string primeiroNome,
        string sobrenome,
        DateOnly dataNascimento,
        string? sexo,
        string? telefone,
        string? email,
        string? logradouro,
        string? cidade,
        string? uf,
        string? cep)
    {
        PrimeiroNome = primeiroNome;
        Sobrenome = sobrenome;
        DataNascimento = dataNascimento;
        Sexo = sexo;
        Telefone = telefone;
        Email = email;
        EnderecoLogradouro = logradouro;
        EnderecoCidade = cidade;
        EnderecoUf = uf;
        EnderecoCep = cep;
        AtualizadoEm = DateTime.UtcNow;

        AdicionarEvento(new PacienteAtualizadoEvent(Id, primeiroNome, sobrenome));
    }

    public void Desativar()
    {
        Ativo = false;
        AtualizadoEm = DateTime.UtcNow;
        AdicionarEvento(new PacienteDesativadoEvent(Id));
    }
}
