namespace AppointmentService.Application.DTOs;

public record GradeHorarioDto(
    Guid Id, Guid IdMedico, int DiaSemana,
    TimeOnly HorarioInicio, TimeOnly HorarioFim,
    int DuracaoSlotMinutos, bool Ativo);
