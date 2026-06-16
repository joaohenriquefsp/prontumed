using MediatR;

namespace PatientService.Application.Commands.CadastrarPaciente;

public record CadastrarPacienteCommand(
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
) : IRequest<Guid>;
