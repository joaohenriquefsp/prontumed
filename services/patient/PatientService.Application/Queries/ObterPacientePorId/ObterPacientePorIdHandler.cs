using MediatR;
using PatientService.Application.DTOs;
using PatientService.Domain.Exceptions;
using PatientService.Domain.Repositories;

namespace PatientService.Application.Queries.ObterPacientePorId;

public class ObterPacientePorIdHandler(IPacienteRepository repository)
    : IRequestHandler<ObterPacientePorIdQuery, PacienteDto>
{
    public async Task<PacienteDto> Handle(ObterPacientePorIdQuery query, CancellationToken ct)
    {
        var paciente = await repository.ObterPorIdAsync(query.Id, ct)
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
