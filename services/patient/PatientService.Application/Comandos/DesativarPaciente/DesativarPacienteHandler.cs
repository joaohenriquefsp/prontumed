using MediatR;
using PatientService.Application.Interfaces;
using PatientService.Domain.Excecoes;
using PatientService.Domain.Repositorios;

namespace PatientService.Application.Comandos.DesativarPaciente;

public class DesativarPacienteHandler(
    IPacienteRepository repository,
    IOutboxPublisher outbox
) : IRequestHandler<DesativarPacienteCommand>
{
    public async Task Handle(DesativarPacienteCommand cmd, CancellationToken ct)
    {
        var paciente = await repository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new PacienteNaoEncontradoException();

        paciente.Desativar();

        await repository.AtualizarAsync(paciente, ct);
        await outbox.PublicarEventosAsync(paciente, ct);
    }
}
