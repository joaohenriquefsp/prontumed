using MediatR;
using AppointmentService.Application.DTOs;

namespace AppointmentService.Application.Queries.ListarConsultas;

public record ListarConsultasQuery(
    Guid? IdMedico, Guid? IdPaciente, string? Status,
    DateTime? DataInicio, DateTime? DataFim,
    int Pagina, int TamanhoPagina) : IRequest<ListarConsultasResult>;

public record ListarConsultasResult(IEnumerable<ConsultaResumoDto> Itens, int Total);
