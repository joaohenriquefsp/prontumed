using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Repositories;
using AppointmentService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Infrastructure.Persistence.Repositories;

public class GradeHorarioRepository(AppDbContext context) : IGradeHorarioRepository
{
    public async Task<GradeHorario?> ObterPorIdAsync(Guid id, CancellationToken ct = default)
        => await context.GradeHorarios.FirstOrDefaultAsync(g => g.Id == id, ct);

    public async Task<IEnumerable<GradeHorario>> ListarPorMedicoAsync(Guid idMedico, CancellationToken ct = default)
        => await context.GradeHorarios
            .Where(g => g.IdMedico == idMedico)
            .OrderBy(g => g.DiaSemana).ThenBy(g => g.HorarioInicio)
            .ToListAsync(ct);

    public async Task<IEnumerable<GradeHorario>> ListarPorMedicoEDiaAsync(Guid idMedico, int diaSemana, CancellationToken ct = default)
        => await context.GradeHorarios
            .Where(g => g.IdMedico == idMedico && g.DiaSemana == diaSemana && g.Ativo)
            .OrderBy(g => g.HorarioInicio)
            .ToListAsync(ct);

    public async Task AdicionarAsync(GradeHorario grade, CancellationToken ct = default)
    {
        await context.GradeHorarios.AddAsync(grade, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task RemoverAsync(GradeHorario grade, CancellationToken ct = default)
    {
        context.GradeHorarios.Remove(grade);
        await context.SaveChangesAsync(ct);
    }
}
