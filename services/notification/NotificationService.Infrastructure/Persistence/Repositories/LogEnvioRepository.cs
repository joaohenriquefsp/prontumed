using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Repositories;

namespace NotificationService.Infrastructure.Persistence.Repositories;

public class LogEnvioRepository(AppDbContext context) : ILogEnvioRepository
{
    public async Task<bool> JaProcessadoAsync(Guid idEvento, string tipoEvento, string canal, CancellationToken ct = default) =>
        await context.LogsEnvio.AnyAsync(
            l => l.IdEvento == idEvento && l.TipoEvento == tipoEvento && l.Canal == canal, ct);

    public async Task RegistrarAsync(LogEnvio log, CancellationToken ct = default)
    {
        await context.LogsEnvio.AddAsync(log, ct);
        await context.SaveChangesAsync(ct);
    }
}
