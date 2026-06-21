using NotificationService.Domain.Entities;

namespace NotificationService.Domain.Repositories;

public interface ILogEnvioRepository
{
    Task<bool> JaProcessadoAsync(Guid idEvento, string tipoEvento, string canal, CancellationToken ct = default);

    Task RegistrarAsync(LogEnvio log, CancellationToken ct = default);
}
