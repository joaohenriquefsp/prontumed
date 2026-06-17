using MediatR;

namespace AppointmentService.Application.Commands.BloquearHorario;

public record BloquearHorarioCommand(
    Guid IdMedico,
    DateTime InicioEm,
    DateTime FimEm,
    string? Motivo) : IRequest<Guid>;
