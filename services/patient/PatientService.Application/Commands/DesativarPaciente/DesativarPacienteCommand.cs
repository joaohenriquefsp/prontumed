using MediatR;

namespace PatientService.Application.Commands.DesativarPaciente;

public record DesativarPacienteCommand(Guid Id) : IRequest;
