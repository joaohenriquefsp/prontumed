namespace AppointmentService.API.Requests;

public record AgendarConsultaRequest(
    Guid IdPaciente,
    Guid IdMedico,
    DateTime AgendadoPara,
    int DuracaoMinutos,
    string? Observacoes);
