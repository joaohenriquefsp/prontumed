using MediatR;

namespace AppointmentService.Application.Commands.AgendarConsulta;

public record AgendarConsultaCommand(
    Guid IdPaciente,
    Guid IdMedico,
    DateTime AgendadoPara,
    int DuracaoMinutos,
    string? Observacoes) : IRequest<Guid>;
