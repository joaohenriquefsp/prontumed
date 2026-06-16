using MediatR;
using PatientService.Application.DTOs;
using PatientService.Domain.Repositorios;

namespace PatientService.Application.Consultas.ListarPacientes;

public class ListarPacientesHandler(IPacienteRepository repository)
    : IRequestHandler<ListarPacientesQuery, ListarPacientesResult>
{
    public async Task<ListarPacientesResult> Handle(ListarPacientesQuery query, CancellationToken ct)
    {
        var (itens, total) = await repository.ListarAsync(
            query.Pagina, query.TamanhoPagina, query.Nome, query.Cpf, ct);

        var dtos = itens.Select(p => new PacienteResumoDto(
            p.Id,
            p.PrimeiroNome,
            p.Sobrenome,
            p.Cpf,
            p.DataNascimento,
            p.Telefone,
            p.Ativo));

        return new ListarPacientesResult(dtos, total);
    }
}
