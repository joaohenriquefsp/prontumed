using MediatR;
using AppointmentService.Application.DTOs;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Queries.ListarGradeHorarios;

public class ListarGradeHorariosHandler(IGradeHorarioRepository repository)
    : IRequestHandler<ListarGradeHorariosQuery, IEnumerable<GradeHorarioDto>>
{
    public async Task<IEnumerable<GradeHorarioDto>> Handle(ListarGradeHorariosQuery query, CancellationToken ct)
    {
        var grades = await repository.ListarPorMedicoAsync(query.IdMedico, ct);
        return grades.Select(g => new GradeHorarioDto(
            g.Id, g.IdMedico, g.DiaSemana, g.HorarioInicio, g.HorarioFim, g.DuracaoSlotMinutos, g.Ativo));
    }
}
