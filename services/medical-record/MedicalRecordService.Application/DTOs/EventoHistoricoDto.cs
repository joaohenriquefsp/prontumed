namespace MedicalRecordService.Application.DTOs;

public record EventoHistoricoDto(Guid Id, string TipoEvento, int Versao, string Payload, DateTime OcorreuEm);
