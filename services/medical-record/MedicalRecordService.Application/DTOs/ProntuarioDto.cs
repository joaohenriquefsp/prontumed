namespace MedicalRecordService.Application.DTOs;

public record ProntuarioDto(Guid Id, Guid IdPaciente, DateTime CriadoEm, IReadOnlyCollection<EntradaDto> Entradas);
