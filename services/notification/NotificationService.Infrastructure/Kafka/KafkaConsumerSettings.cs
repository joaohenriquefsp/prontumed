namespace NotificationService.Infrastructure.Kafka;

public class KafkaConsumerSettings
{
    public const string SectionName = "Kafka";

    public string BootstrapServers { get; set; } = string.Empty;
    public string GroupId { get; set; } = "notification-service";

    // O tópico real não é "prontumed.Appointment" (nome do serviço) e sim
    // "prontumed.Consulta" — o Outbox usa agregado.GetType().Name (a classe
    // do Aggregate Root, em português) como tipo_agregado, não o nome do
    // serviço. A documentação da arquitetura usa o nome em inglês por
    // engano; o nome real do tópico é este.
    public string TopicoConsultas { get; set; } = "prontumed.Consulta";
}
