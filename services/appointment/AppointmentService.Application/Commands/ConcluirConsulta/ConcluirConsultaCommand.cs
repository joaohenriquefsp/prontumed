using MediatR;

namespace AppointmentService.Application.Commands.ConcluirConsulta;

public record ConcluirConsultaCommand(Guid Id, string? Observacoes) : IRequest;
