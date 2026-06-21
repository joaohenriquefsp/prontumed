using Microsoft.EntityFrameworkCore;
using NotificationService.Domain.Entities;
using NotificationService.Domain.Repositories;

namespace NotificationService.Infrastructure.Persistence.Repositories;

public class ModeloNotificacaoRepository(AppDbContext context) : IModeloNotificacaoRepository
{
    public async Task<IReadOnlyList<ModeloNotificacao>> ObterAtivosPorTipoEventoAsync(string tipoEvento, CancellationToken ct = default) =>
        await context.ModelosNotificacao
            .Where(m => m.TipoEvento == tipoEvento && m.Ativo)
            .ToListAsync(ct);
}
