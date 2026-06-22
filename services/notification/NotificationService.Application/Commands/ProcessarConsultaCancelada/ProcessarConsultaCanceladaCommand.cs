using MediatR;

namespace NotificationService.Application.Commands.ProcessarConsultaCancelada;

public record ProcessarConsultaCanceladaCommand(
    Guid IdEvento,
    Guid IdConsulta,
    Guid IdPaciente,
    Guid IdMedico,
    DateTime AgendadoPara,
    string? Motivo) : IRequest;
