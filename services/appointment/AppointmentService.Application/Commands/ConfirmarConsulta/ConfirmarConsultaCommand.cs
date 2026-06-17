using MediatR;

namespace AppointmentService.Application.Commands.ConfirmarConsulta;

public record ConfirmarConsultaCommand(Guid Id) : IRequest;
