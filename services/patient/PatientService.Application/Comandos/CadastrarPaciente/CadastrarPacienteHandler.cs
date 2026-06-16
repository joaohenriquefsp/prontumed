using MediatR;
using PatientService.Application.Interfaces;
using PatientService.Domain.Entidades;
using PatientService.Domain.Excecoes;
using PatientService.Domain.Repositorios;

namespace PatientService.Application.Comandos.CadastrarPaciente;

public class CadastrarPacienteHandler(
    IPacienteRepository repository,
    IOutboxPublisher outbox
) : IRequestHandler<CadastrarPacienteCommand, Guid>
{
    public async Task<Guid> Handle(CadastrarPacienteCommand cmd, CancellationToken ct)
    {
        if (await repository.CpfJaExisteAsync(cmd.Cpf, ct))
            throw new CpfJaCadastradoException(cmd.Cpf);

        var paciente = Paciente.Criar(
            cmd.PrimeiroNome,
            cmd.Sobrenome,
            cmd.Cpf,
            cmd.DataNascimento,
            cmd.Sexo,
            cmd.Telefone,
            cmd.Email,
            cmd.Logradouro,
            cmd.Cidade,
            cmd.Uf,
            cmd.Cep,
            cmd.IdUsuario);

        await repository.AdicionarAsync(paciente, ct);
        await outbox.PublicarEventosAsync(paciente, ct);

        return paciente.Id;
    }
}
