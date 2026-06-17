namespace AppointmentService.Application.DTOs;

public record ConsultaDto(
    Guid Id, Guid IdPaciente, Guid IdMedico,
    DateTime AgendadoPara, int DuracaoMinutos, string Status,
    string? MotivoCancelamento, string? Observacoes,
    DateTime CriadoEm, DateTime AtualizadoEm);
