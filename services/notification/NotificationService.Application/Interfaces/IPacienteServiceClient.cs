using NotificationService.Application.DTOs;

namespace NotificationService.Application.Interfaces;

public interface IPacienteServiceClient
{
    Task<PacienteDto?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
}
