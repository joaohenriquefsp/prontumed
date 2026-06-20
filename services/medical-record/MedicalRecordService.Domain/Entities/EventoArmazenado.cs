namespace MedicalRecordService.Domain.Entities;

// Linha de repositorio_eventos — o event store. Append-only, nunca UPDATE/DELETE.
public class EventoArmazenado
{
    public Guid Id { get; set; }
    public Guid IdAgregado { get; set; }
    public string TipoAgregado { get; set; } = "MedicalRecord";
    public string TipoEvento { get; set; } = string.Empty;
    public int Versao { get; set; }
    public string Payload { get; set; } = string.Empty;
    public string? Metadados { get; set; }
    public DateTime OcorreuEm { get; set; }
}
