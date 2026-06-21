using MediatR;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Commands.ProcessarConsultaConcluida;

public class ProcessarConsultaConcluidaCommandHandler(INotificacaoService notificacaoService)
    : IRequestHandler<ProcessarConsultaConcluidaCommand>
{
    public Task Handle(ProcessarConsultaConcluidaCommand request, CancellationToken cancellationToken) =>
        notificacaoService.ProcessarAsync(
            TipoEvento.ConsultaConcluida,
            request.IdEvento,
            request.IdPaciente,
            request.IdMedico,
            request.AgendadoPara,
            motivo: null,
            cancellationToken);
}
