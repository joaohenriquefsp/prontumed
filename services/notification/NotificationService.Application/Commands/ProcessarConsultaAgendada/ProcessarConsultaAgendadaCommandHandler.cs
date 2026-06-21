using MediatR;
using NotificationService.Application.Interfaces;
using NotificationService.Domain.Entities;

namespace NotificationService.Application.Commands.ProcessarConsultaAgendada;

public class ProcessarConsultaAgendadaCommandHandler(INotificacaoService notificacaoService)
    : IRequestHandler<ProcessarConsultaAgendadaCommand>
{
    public Task Handle(ProcessarConsultaAgendadaCommand request, CancellationToken cancellationToken) =>
        notificacaoService.ProcessarAsync(
            TipoEvento.ConsultaAgendada,
            request.IdEvento,
            request.IdPaciente,
            request.IdMedico,
            request.AgendadoPara,
            motivo: null,
            cancellationToken);
}
