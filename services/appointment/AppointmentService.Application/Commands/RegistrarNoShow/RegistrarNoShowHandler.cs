using System.Text.Json;
using MediatR;
using AppointmentService.Application.Interfaces;
using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.RegistrarNoShow;

public class RegistrarNoShowHandler(
    IConsultaRepository consultaRepository,
    IEstadoSagaRepository sagaRepository,
    IOutboxPublisher outbox
) : IRequestHandler<RegistrarNoShowCommand>
{
    public async Task Handle(RegistrarNoShowCommand cmd, CancellationToken ct)
    {
        var consulta = await consultaRepository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new ConsultaNaoEncontradaException();

        consulta.RegistrarNoShow();

        var saga = await sagaRepository.ObterPorCorrelacaoAsync(consulta.Id, ct);
        if (saga is not null)
        {
            var payload = JsonSerializer.Serialize(new { idConsulta = consulta.Id, statusConsulta = StatusConsulta.NoShow });
            saga.AtualizarEtapa("NoShowRegistrado", StatusSaga.Concluido, payload);
            await sagaRepository.AtualizarAsync(saga, ct);
        }

        await consultaRepository.AtualizarAsync(consulta, ct);
        await outbox.PublicarEventosAsync(consulta, ct);
    }
}
