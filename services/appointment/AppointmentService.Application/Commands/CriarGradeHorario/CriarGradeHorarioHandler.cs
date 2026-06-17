using MediatR;
using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Repositories;

namespace AppointmentService.Application.Commands.CriarGradeHorario;

public class CriarGradeHorarioHandler(IGradeHorarioRepository repository)
    : IRequestHandler<CriarGradeHorarioCommand, Guid>
{
    public async Task<Guid> Handle(CriarGradeHorarioCommand cmd, CancellationToken ct)
    {
        var grade = GradeHorario.Criar(cmd.IdMedico, cmd.DiaSemana, cmd.HorarioInicio, cmd.HorarioFim, cmd.DuracaoSlotMinutos);
        await repository.AdicionarAsync(grade, ct);
        return grade.Id;
    }
}
