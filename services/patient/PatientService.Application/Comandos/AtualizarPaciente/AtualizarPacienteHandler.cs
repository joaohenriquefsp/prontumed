using MediatR;
using PatientService.Application.Interfaces;
using PatientService.Domain.Excecoes;
using PatientService.Domain.Repositorios;

namespace PatientService.Application.Comandos.AtualizarPaciente;

public class AtualizarPacienteHandler(
    IPacienteRepository repository,
    IOutboxPublisher outbox
) : IRequestHandler<AtualizarPacienteCommand>
{
    public async Task Handle(AtualizarPacienteCommand cmd, CancellationToken ct)
    {
        var paciente = await repository.ObterPorIdAsync(cmd.Id, ct)
            ?? throw new PacienteNaoEncontradoException();

        paciente.Atualizar(
            cmd.PrimeiroNome,
            cmd.Sobrenome,
            cmd.DataNascimento,
            cmd.Sexo,
            cmd.Telefone,
            cmd.Email,
            cmd.Logradouro,
            cmd.Cidade,
            cmd.Uf,
            cmd.Cep);

        await repository.AtualizarAsync(paciente, ct);
        await outbox.PublicarEventosAsync(paciente, ct);
    }
}
