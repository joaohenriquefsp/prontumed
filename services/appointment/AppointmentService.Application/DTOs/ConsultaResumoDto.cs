namespace AppointmentService.Application.DTOs;

public record ConsultaResumoDto(
    Guid Id, Guid IdPaciente, Guid IdMedico,
    DateTime AgendadoPara, int DuracaoMinutos, string Status);
