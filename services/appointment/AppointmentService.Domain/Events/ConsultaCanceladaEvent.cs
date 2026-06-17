namespace AppointmentService.Domain.Events;
public record ConsultaCanceladaEvent(Guid IdConsulta, Guid IdPaciente, Guid IdMedico, DateTime AgendadoPara, string? Motivo) : IDomainEvent;
