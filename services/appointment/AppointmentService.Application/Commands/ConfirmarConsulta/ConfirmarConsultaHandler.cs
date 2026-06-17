using System.Text.Json;
using MediatR;
using AppointmentService.Application.Interfaces;
using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.ConfirmarConsulta;

public class ConfirmarConsultaHandler(
    IConsultaRepository consultaRepository,
    IEstadoSagaRepository sagaRepository,
    IOutboxPublisher outbox
) : IRequestHandler<ConfirmarConsultaCommand>
{
    public async Task Handle(ConfirmarConsultaCommand cmd, CancellationToken ct)
    {
        var consulta = await consultaRepository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new ConsultaNaoEncontradaException();

        consulta.Confirmar();

        var saga = await sagaRepository.ObterPorCorrelacaoAsync(consulta.Id, ct);
        if (saga is not null)
        {
            var payload = JsonSerializer.Serialize(new { idConsulta = consulta.Id, statusConsulta = StatusConsulta.Confirmado });
            saga.AtualizarEtapa("ConsultaConfirmada", StatusSaga.EmAndamento, payload);
            await sagaRepository.AtualizarAsync(saga, ct);
        }

        await consultaRepository.AtualizarAsync(consulta, ct);
        await outbox.PublicarEventosAsync(consulta, ct);
    }
}
