using System.Text.Json;
using MediatR;
using AppointmentService.Application.Interfaces;
using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.ConcluirConsulta;

public class ConcluirConsultaHandler(
    IConsultaRepository consultaRepository,
    IEstadoSagaRepository sagaRepository,
    IOutboxPublisher outbox
) : IRequestHandler<ConcluirConsultaCommand>
{
    public async Task Handle(ConcluirConsultaCommand cmd, CancellationToken ct)
    {
        var consulta = await consultaRepository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new ConsultaNaoEncontradaException();

        consulta.Concluir(cmd.Observacoes);

        var saga = await sagaRepository.ObterPorCorrelacaoAsync(consulta.Id, ct);
        if (saga is not null)
        {
            var payload = JsonSerializer.Serialize(new { idConsulta = consulta.Id, statusConsulta = StatusConsulta.Concluido });
            saga.AtualizarEtapa("ConsultaConcluida", StatusSaga.Concluido, payload);
            await sagaRepository.AtualizarAsync(saga, ct);
        }

        await consultaRepository.AtualizarAsync(consulta, ct);
        await outbox.PublicarEventosAsync(consulta, ct);
    }
}
