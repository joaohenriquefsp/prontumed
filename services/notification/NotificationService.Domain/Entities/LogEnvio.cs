namespace NotificationService.Domain.Entities;

public class LogEnvio
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    // Igual a id_agregado do evento de origem (= IdConsulta), não um ID
    // exclusivo por evento — por isso a idempotência combina este campo
    // com TipoEvento e Canal (ver UNIQUE em infra/postgres/notifications).
    public Guid IdEvento { get; private set; }
    public string TipoEvento { get; private set; } = string.Empty;
    public Guid IdDestinatario { get; private set; }
    public string Canal { get; private set; } = string.Empty;
    public string Status { get; private set; } = StatusEnvio.Pending;
    public DateTime? EnviadoEm { get; private set; }
    public string? MensagemErro { get; private set; }
    public DateTime CriadoEm { get; private set; } = DateTime.UtcNow;

    private LogEnvio() { }

    public static LogEnvio RegistrarSucesso(Guid idEvento, string tipoEvento, Guid idDestinatario, string canal) =>
        new()
        {
            IdEvento = idEvento,
            TipoEvento = tipoEvento,
            IdDestinatario = idDestinatario,
            Canal = canal,
            Status = StatusEnvio.Sent,
            EnviadoEm = DateTime.UtcNow
        };

    public static LogEnvio RegistrarFalha(Guid idEvento, string tipoEvento, Guid idDestinatario, string canal, string mensagemErro) =>
        new()
        {
            IdEvento = idEvento,
            TipoEvento = tipoEvento,
            IdDestinatario = idDestinatario,
            Canal = canal,
            Status = StatusEnvio.Failed,
            MensagemErro = mensagemErro
        };
}
