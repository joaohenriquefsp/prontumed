namespace NotificationService.Domain.Entities;

// Nome da classe do evento de domínio publicado pelo Appointment Service
// (TipoEvento = evento.GetType().Name no Outbox) — não traduzir/abreviar,
// precisa bater exatamente com o que chega no header "eventType" do Kafka.
public static class TipoEvento
{
    public const string ConsultaAgendada = "ConsultaAgendadaEvent";
    public const string ConsultaCancelada = "ConsultaCanceladaEvent";
    public const string ConsultaConcluida = "ConsultaConcluidaEvent";
}
