namespace NotificationService.Application.Interfaces;

public interface IPushSender
{
    Task EnviarAsync(Guid idDestinatario, string corpo, CancellationToken ct = default);
}
