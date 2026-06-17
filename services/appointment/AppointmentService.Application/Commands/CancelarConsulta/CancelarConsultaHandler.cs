using System.Text.Json;
using MediatR;
using AppointmentService.Application.Interfaces;
using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.CancelarConsulta;

public class CancelarConsultaHandler(
    IConsultaRepository consultaRepository,
    IEstadoSagaRepository sagaRepository,
    IOutboxPublisher outbox
) : IRequestHandler<CancelarConsultaCommand>
{
    public async Task Handle(CancelarConsultaCommand cmd, CancellationToken ct)
    {
        var consulta = await consultaRepository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new ConsultaNaoEncontradaException();

        consulta.Cancelar(cmd.Motivo);

        var saga = await sagaRepository.ObterPorCorrelacaoAsync(consulta.Id, ct);
        if (saga is not null)
        {
            var payload = JsonSerializer.Serialize(new { idConsulta = consulta.Id, motivo = cmd.Motivo, statusConsulta = StatusConsulta.Cancelado });
            saga.AtualizarEtapa("ConsultaCancelada", StatusSaga.Concluido, payload);
            await sagaRepository.AtualizarAsync(saga, ct);
        }

        await consultaRepository.AtualizarAsync(consulta, ct);
        await outbox.PublicarEventosAsync(consulta, ct);
    }
}
