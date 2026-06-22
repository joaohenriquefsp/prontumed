namespace NotificationService.Infrastructure.Kafka.Payloads;

// Espelha AppointmentService.Domain.Events.ConsultaConcluidaEvent.
public record ConsultaConcluidaPayload(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara);
