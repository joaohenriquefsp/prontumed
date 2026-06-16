namespace PatientService.API.Requests;

public record AtualizarPacienteRequest(
    string PrimeiroNome,
    string Sobrenome,
    DateOnly DataNascimento,
    string? Sexo,
    string? Telefone,
    string? Email,
    string? Logradouro,
    string? Cidade,
    string? Uf,
    string? Cep
);
