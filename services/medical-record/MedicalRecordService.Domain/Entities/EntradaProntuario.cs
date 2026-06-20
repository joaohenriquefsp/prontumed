namespace MedicalRecordService.Domain.Entities;

public record EntradaProntuario(Guid Id, Guid IdMedico, string Tipo, string Conteudo, DateTime OcorreuEm);
