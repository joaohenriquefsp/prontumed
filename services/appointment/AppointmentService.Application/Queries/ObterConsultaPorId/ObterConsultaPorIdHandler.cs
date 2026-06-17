using MediatR;
using AppointmentService.Application.DTOs;
using AppointmentService.Domain.Exceptions;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Queries.ObterConsultaPorId;

public class ObterConsultaPorIdHandler(IConsultaRepository repository)
    : IRequestHandler<ObterConsultaPorIdQuery, ConsultaDto>
{
    public async Task<ConsultaDto> Handle(ObterConsultaPorIdQuery query, CancellationToken ct)
    {
        var consulta = await repository.ObterPorIdAsync(query.Id, ct)
            ?? throw new ConsultaNaoEncontradaException();

        return new ConsultaDto(
            consulta.Id, consulta.IdPaciente, consulta.IdMedico,
            consulta.AgendadoPara, consulta.DuracaoMinutos, consulta.Status,
            consulta.MotivoCancelamento, consulta.Observacoes,
            consulta.CriadoEm, consulta.AtualizadoEm);
    }
}
