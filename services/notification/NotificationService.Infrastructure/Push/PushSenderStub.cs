using Microsoft.Extensions.Logging;
using NotificationService.Application.Interfaces;

namespace NotificationService.Infrastructure.Push;

// Stub: o App Mobile ainda não existe, então não há push token para enviar
// de fato. Registra a intenção de envio via log (e via logs_envio, feito
// pelo chamador) para que o fluxo fique completo e auditável já agora —
// trocar por Firebase/Expo Push quando o App Mobile existir.
public class PushSenderStub(ILogger<PushSenderStub> logger) : IPushSender
{
    public Task EnviarAsync(Guid idDestinatario, string corpo, CancellationToken ct = default)
    {
        logger.LogInformation("[PUSH SIMULADO] destinatario={IdDestinatario} corpo={Corpo}", idDestinatario, corpo);
        return Task.CompletedTask;
    }
}
