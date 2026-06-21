using MediatR;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Commands.ProcessarConsultaCancelada;

public class ProcessarConsultaCanceladaCommandHandler(INotificacaoService notificacaoService)
    : IRequestHandler<ProcessarConsultaCanceladaCommand>
{
    public Task Handle(ProcessarConsultaCanceladaCommand request, CancellationToken cancellationToken) =>
        notificacaoService.ProcessarAsync(
            TipoEvento.ConsultaCancelada,
            request.IdEvento,
            request.IdPaciente,
            request.IdMedico,
            request.AgendadoPara,
            request.Motivo,
            cancellationToken);
}
