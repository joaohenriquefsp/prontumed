namespace PatientService.Application.DTOs;

public record PacienteDto(
    Guid Id,
    Guid? IdUsuario,
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
    bool Ativo
);
