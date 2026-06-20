using MediatR;
using MedicalRecordService.Application.Interfaces;
using MedicalRecordService.Domain.Entities;
using MedicalRecordService.Domain.Repositories;

namespace MedicalRecordService.Application.Commands.CriarProntuario;

public class CriarProntuarioHandler(
    IProntuarioRepository repository,
    IOutboxPublisher outbox
) : IRequestHandler<CriarProntuarioCommand, Unit>
{
    public async Task<Unit> Handle(CriarProntuarioCommand cmd, CancellationToken ct)
    {
        var prontuario = Prontuario.Criar(cmd.IdPaciente, cmd.IdMedicoCriador);

        await repository.AdicionarAsync(prontuario, ct);
        await outbox.PublicarEventosAsync(prontuario, ct);

        return Unit.Value;
    }
}
