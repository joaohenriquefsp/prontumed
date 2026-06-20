namespace MedicalRecordService.Domain.Events;

public record ExamRequestedEvent(Guid IdProntuario, Guid IdEntrada, Guid IdMedico, string Conteudo, DateTime OcorreuEm) : IDomainEvent;
