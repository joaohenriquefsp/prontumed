namespace MedicalRecordService.Infrastructure.Outbox;

public class EventoSaida
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TipoAgregado { get; set; } = string.Empty;
    public Guid IdAgregado { get; set; }
    public string TipoEvento { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
