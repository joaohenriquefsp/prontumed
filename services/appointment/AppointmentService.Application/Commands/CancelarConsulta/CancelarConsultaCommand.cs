using MediatR;

namespace AppointmentService.Application.Commands.CancelarConsulta;

public record CancelarConsultaCommand(Guid Id, string? Motivo) : IRequest;
