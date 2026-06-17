using MediatR;
using AppointmentService.Application.DTOs;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Queries.ListarConsultas;

public class ListarConsultasHandler(IConsultaRepository repository)
    : IRequestHandler<ListarConsultasQuery, ListarConsultasResult>
{
    public async Task<ListarConsultasResult> Handle(ListarConsultasQuery query, CancellationToken ct)
    {
        var (itens, total) = await repository.ListarAsync(
            query.IdMedico, query.IdPaciente, query.Status,
            query.DataInicio, query.DataFim,
            query.Pagina, query.TamanhoPagina, ct);

        var dtos = itens.Select(c => new ConsultaResumoDto(
            c.Id, c.IdPaciente, c.IdMedico, c.AgendadoPara, c.DuracaoMinutos, c.Status));

        return new ListarConsultasResult(dtos, total);
    }
}
