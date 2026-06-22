namespace NotificationService.Infrastructure.Kafka.Payloads;

// Espelha AppointmentService.Domain.Events.ConsultaAgendadaEvent — o
// Notification Service não referencia o assembly do Appointment, então
// define seu próprio contrato de leitura para o payload do Kafka.
public record ConsultaAgendadaPayload(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara, int DuracaoMinutos);
