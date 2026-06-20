namespace MedicalRecordService.Domain.Events;

public record PrescriptionAddedEvent(Guid IdProntuario, Guid IdEntrada, Guid IdMedico, string Conteudo, DateTime OcorreuEm) : IDomainEvent;
