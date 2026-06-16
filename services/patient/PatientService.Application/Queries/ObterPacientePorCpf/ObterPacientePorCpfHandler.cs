using MediatR;
using PatientService.Application.DTOs;
using PatientService.Domain.Exceptions;
using PatientService.Domain.Repositories;

namespace PatientService.Application.Queries.ObterPacientePorCpf;

public class ObterPacientePorCpfHandler(IPacienteRepository repository)
    : IRequestHandler<ObterPacientePorCpfQuery, PacienteDto>
{
    public async Task<PacienteDto> Handle(ObterPacientePorCpfQuery query, CancellationToken ct)
    {
        var paciente = await repository.ObterPorCpfAsync(query.Cpf, ct)
            ?? throw new PacienteNaoEncontradoException();

        return new PacienteDto(
            paciente.Id,
            paciente.IdUsuario,
            paciente.PrimeiroNome,
            paciente.Sobrenome,
            paciente.Cpf,
            paciente.DataNascimento,
            paciente.Sexo,
            paciente.Telefone,
            paciente.Email,
            paciente.EnderecoLogradouro,
            paciente.EnderecoCidade,
            paciente.EnderecoUf,
            paciente.EnderecoCep,
            paciente.Ativo);
    }
}
