namespace NotificationService.Infrastructure.Kafka;

public class KafkaConsumerSettings
{
    public const string SectionName = "Kafka";

    public string BootstrapServers { get; set; } = string.Empty;
    public string GroupId { get; set; } = "notification-service";
    public string TopicoConsultas { get; set; } = "prontumed.Appointment";
}
