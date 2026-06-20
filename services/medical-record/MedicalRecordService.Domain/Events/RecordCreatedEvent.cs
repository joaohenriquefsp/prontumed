namespace MedicalRecordService.Domain.Events;

public record RecordCreatedEvent(Guid IdPaciente, Guid IdMedico, DateTime CriadoEm) : IDomainEvent;
