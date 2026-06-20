using MediatR;
using MedicalRecordService.Application.Interfaces;
using MedicalRecordService.Domain.Exceptions;
using MedicalRecordService.Domain.Repositories;

namespace MedicalRecordService.Application.Commands.AdicionarEntrada;

public class AdicionarEntradaHandler(
    IProntuarioRepository repository,
    IOutboxPublisher outbox
) : IRequestHandler<AdicionarEntradaCommand, Guid>
{
    public async Task<Guid> Handle(AdicionarEntradaCommand cmd, CancellationToken ct)
    {
        var prontuario = await repository.ObterPorIdPacienteAsync(cmd.IdPaciente, ct)
            ?? throw new ProntuarioNaoEncontradoException(cmd.IdPaciente);

        prontuario.AdicionarEntrada(cmd.IdMedico, cmd.TipoEntrada, cmd.Conteudo);
        var idEntrada = prontuario.Entradas.Last().Id;

        await repository.AdicionarAsync(prontuario, ct);
        await outbox.PublicarEventosAsync(prontuario, ct);

        return idEntrada;
    }
}
