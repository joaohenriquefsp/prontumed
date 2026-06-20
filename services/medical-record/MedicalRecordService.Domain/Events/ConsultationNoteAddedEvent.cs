namespace MedicalRecordService.Domain.Events;

public record ConsultationNoteAddedEvent(Guid IdProntuario, Guid IdEntrada, Guid IdMedico, string Conteudo, DateTime OcorreuEm) : IDomainEvent;
