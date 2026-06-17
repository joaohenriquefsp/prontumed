namespace AppointmentService.Domain.Entities;

public static class StatusSaga
{
    public const string EmAndamento = "InProgress";
    public const string Concluido = "Completed";
    public const string Falhou = "Failed";
    public const string Compensando = "Compensating";
}
