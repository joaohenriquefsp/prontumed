using MediatR;

namespace NotificationService.Application.Commands.ProcessarConsultaConcluida;

public record ProcessarConsultaConcluidaCommand(
    Guid IdEvento,
    Guid IdConsulta,
    Guid IdPaciente,
    Guid IdMedico,
    DateTime AgendadoPara) : IRequest;
