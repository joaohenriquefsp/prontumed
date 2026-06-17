namespace AppointmentService.API.Requests;

public record CriarGradeHorarioRequest(
    Guid IdMedico,
    int DiaSemana,
    TimeOnly HorarioInicio,
    TimeOnly HorarioFim,
    int DuracaoSlotMinutos);
