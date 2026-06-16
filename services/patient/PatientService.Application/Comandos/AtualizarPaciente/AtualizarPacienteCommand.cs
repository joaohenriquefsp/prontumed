using MediatR;

namespace PatientService.Application.Comandos.AtualizarPaciente;

public record AtualizarPacienteCommand(
    Guid Id,
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
) : IRequest;
