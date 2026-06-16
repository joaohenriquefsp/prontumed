using MediatR;
using PatientService.Application.DTOs;

namespace PatientService.Application.Queries.ListarPacientes;

public record ListarPacientesQuery(
    int Pagina,
    int TamanhoPagina,
    string? Nome,
    string? Cpf
) : IRequest<ListarPacientesResult>;

public record ListarPacientesResult(IEnumerable<PacienteResumoDto> Itens, int Total);
