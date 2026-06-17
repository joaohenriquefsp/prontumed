namespace AppointmentService.API.Requests;

public record BloquearHorarioRequest(
    Guid IdMedico,
    DateTime InicioEm,
    DateTime FimEm,
    string? Motivo);
