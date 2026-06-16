namespace PatientService.Application.DTOs;

public record PacienteResumoDto(
    Guid Id,
    string PrimeiroNome,
    string Sobrenome,
    string Cpf,
    DateOnly DataNascimento,
    string? Telefone,
    bool Ativo
);
