namespace PatientService.API.Requisicoes;

public record CadastrarPacienteRequest(
    string PrimeiroNome,
    string Sobrenome,
    string Cpf,
    DateOnly DataNascimento,
    string? Sexo,
    string? Telefone,
    string? Email,
    string? Logradouro,
    string? Cidade,
    string? Uf,
    string? Cep,
    Guid? IdUsuario
);
