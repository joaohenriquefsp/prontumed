using NotificationService.Domain.Entities;

namespace NotificationService.Domain.Repositories;

public interface IModeloNotificacaoRepository
{
    Task<IReadOnlyList<ModeloNotificacao>> ObterAtivosPorTipoEventoAsync(string tipoEvento, CancellationToken ct = default);
}
