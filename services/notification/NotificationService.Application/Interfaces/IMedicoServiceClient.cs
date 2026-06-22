using NotificationService.Application.DTOs;

namespace NotificationService.Application.Interfaces;

public interface IMedicoServiceClient
{
    Task<MedicoDto?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
}
