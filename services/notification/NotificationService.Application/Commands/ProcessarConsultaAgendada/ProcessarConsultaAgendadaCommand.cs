using MediatR;

namespace NotificationService.Application.Commands.ProcessarConsultaAgendada;

public record ProcessarConsultaAgendadaCommand(
    Guid IdEvento,
    Guid IdConsulta,
    Guid IdPaciente,
    Guid IdMedico,
    DateTime AgendadoPara,
    int DuracaoMinutos) : IRequest;
