namespace MedicalRecordService.Domain.Events;

public record DiagnosisAddedEvent(Guid IdProntuario, Guid IdEntrada, Guid IdMedico, string Conteudo, DateTime OcorreuEm) : IDomainEvent;
