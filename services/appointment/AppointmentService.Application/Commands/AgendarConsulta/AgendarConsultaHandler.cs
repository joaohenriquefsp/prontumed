using System.Text.Json;
using MediatR;
using AppointmentService.Application.Interfaces;
using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.AgendarConsulta;

public class AgendarConsultaHandler(
    IConsultaRepository consultaRepository,
    IEstadoSagaRepository sagaRepository,
    IOutboxPublisher outbox
) : IRequestHandler<AgendarConsultaCommand, Guid>
{
    public async Task<Guid> Handle(AgendarConsultaCommand cmd, CancellationToken ct)
    {
        if (await consultaRepository.SlotOcupadoAsync(cmd.IdMedico, cmd.AgendadoPara, cmd.DuracaoMinutos, ct: ct))
            throw new SlotIndisponivelException(cmd.AgendadoPara);

        var consulta = Consulta.Criar(cmd.IdPaciente, cmd.IdMedico, cmd.AgendadoPara, cmd.DuracaoMinutos, cmd.Observacoes);

        var payloadSaga = JsonSerializer.Serialize(new
        {
            idConsulta = consulta.Id,
            idPaciente = cmd.IdPaciente,
            idMedico = cmd.IdMedico,
            agendadoPara = cmd.AgendadoPara,
            statusConsulta = StatusConsulta.Agendado
        });
        var saga = EstadoSaga.Criar(consulta.Id, "AgendamentoConsulta", "ConsultaAgendada", payloadSaga);

        await consultaRepository.AdicionarAsync(consulta, ct);
        await sagaRepository.AdicionarAsync(saga, ct);
        await outbox.PublicarEventosAsync(consulta, ct);

        return consulta.Id;
    }
}
