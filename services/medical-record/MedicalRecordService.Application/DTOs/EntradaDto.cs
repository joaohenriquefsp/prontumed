namespace MedicalRecordService.Application.DTOs;

public record EntradaDto(Guid Id, Guid IdMedico, string Tipo, string Conteudo, DateTime OcorreuEm);
