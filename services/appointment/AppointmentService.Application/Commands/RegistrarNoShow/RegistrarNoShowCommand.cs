using MediatR;

namespace AppointmentService.Application.Commands.RegistrarNoShow;

public record RegistrarNoShowCommand(Guid Id) : IRequest;
