using MediatR;

namespace PatientService.Application.Comandos.DesativarPaciente;

public record DesativarPacienteCommand(Guid Id) : IRequest;
