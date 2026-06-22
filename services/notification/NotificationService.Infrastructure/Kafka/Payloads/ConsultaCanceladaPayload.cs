namespace NotificationService.Infrastructure.Kafka.Payloads;

// Espelha AppointmentService.Domain.Events.ConsultaCanceladaEvent.
public record ConsultaCanceladaPayload(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara, string? Motivo);
