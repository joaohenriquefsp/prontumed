using AppointmentService.Domain.Entities;
using AppointmentService.Domain.Repositories;
using AppointmentService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AppointmentService.Infrastructure.Persistence.Repositories;

public class HorarioBloqueadoRepository(AppDbContext context) : IHorarioBloqueadoRepository
{
    public async Task<HorarioBloqueado?> ObterPorIdAsync(Guid id, CancellationToken ct = default)
        => await context.HorariosBloqueados.FirstOrDefaultAsync(h => h.Id == id, ct);

    public async Task<IEnumerable<HorarioBloqueado>> ListarPorMedicoEPeriodoAsync(Guid idMedico, DateTime inicio, DateTime fim, CancellationToken ct = default)
        => await context.HorariosBloqueados
            .Where(h => h.IdMedico == idMedico && h.InicioEm < fim && h.FimEm > inicio)
            .ToListAsync(ct);

    public async Task AdicionarAsync(HorarioBloqueado horario, CancellationToken ct = default)
    {
        await context.HorariosBloqueados.AddAsync(horario, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task RemoverAsync(HorarioBloqueado horario, CancellationToken ct = default)
    {
        context.HorariosBloqueados.Remove(horario);
        await context.SaveChangesAsync(ct);
    }
}
