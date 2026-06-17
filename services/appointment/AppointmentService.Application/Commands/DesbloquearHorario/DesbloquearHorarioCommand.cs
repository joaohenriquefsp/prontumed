using MediatR;

namespace AppointmentService.Application.Commands.DesbloquearHorario;

public record DesbloquearHorarioCommand(Guid Id) : IRequest;
